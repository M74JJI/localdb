import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { createReadStream, existsSync, readFileSync, writeFileSync, chmodSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { hash, verify } from "@node-rs/argon2";
import { masterKeyPath } from "@localdb-hub/config";

const SECRET_PREFIX = "ldh-v1";

export async function hashPassword(password: string) {
  return hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
  });
}

export async function verifyPassword(passwordHash: string, password: string) {
  return verify(passwordHash, password);
}

export function generateToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export async function sha256File(path: string) {
  return new Promise<string>((resolve, reject) => {
    const h = createHash("sha256");
    const stream = createReadStream(path);

    stream.on("data", (chunk) => h.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(h.digest("hex")));
  });
}

export function generatePassword(length = 24) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const buf = randomBytes(length);
  let out = "";

  for (const byte of buf) {
    out += alphabet[byte % alphabet.length];
  }

  return out;
}

export function ensureMasterKey() {
  if (existsSync(masterKeyPath)) {
    return masterKeyPath;
  }

  mkdirSync(dirname(masterKeyPath), { recursive: true });
  writeFileSync(masterKeyPath, randomBytes(32).toString("base64url"));

  try {
    chmodSync(masterKeyPath, 0o600);
  } catch {
    // Windows local development may not support POSIX mode bits.
  }

  return masterKeyPath;
}

export function getMasterKeyStatus() {
  return {
    path: masterKeyPath,
    exists: existsSync(masterKeyPath)
  };
}

function readMasterKeyBytes() {
  ensureMasterKey();

  const raw = readFileSync(masterKeyPath, "utf8").trim();

  if (!raw) {
    throw new Error(`Master key file is empty: ${masterKeyPath}`);
  }

  const decoded = Buffer.from(raw, "base64url");

  if (decoded.length === 32) {
    return decoded;
  }

  // Fallback for manually supplied string keys. Always derives exactly 32 bytes.
  return createHash("sha256").update(raw).digest();
}

export function encryptSecret(plaintext: string) {
  const key = readMasterKeyBytes();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    SECRET_PREFIX,
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url")
  ].join(":");
}

export function decryptSecret(ciphertext: string) {
  if (ciphertext.startsWith("dev-plaintext:")) {
    return ciphertext.replace("dev-plaintext:", "");
  }

  const parts = ciphertext.split(":");

  if (parts.length !== 4 || parts[0] !== SECRET_PREFIX) {
    throw new Error("Unsupported secret ciphertext format");
  }

  const ivRaw = parts[1];
  const tagRaw = parts[2];
  const ciphertextRaw = parts[3];

  if (!ivRaw || !tagRaw || !ciphertextRaw) {
    throw new Error("Invalid secret ciphertext format");
  }

  const key = readMasterKeyBytes();
  const iv = Buffer.from(ivRaw, "base64url");
  const tag = Buffer.from(tagRaw, "base64url");
  const encrypted = Buffer.from(ciphertextRaw, "base64url");

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export function isEncryptedSecret(value: string) {
  return value.startsWith(`${SECRET_PREFIX}:`);
}
