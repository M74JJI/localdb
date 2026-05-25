packer {
  required_plugins {
    virtualbox = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/virtualbox"
    }
  }
}

source "virtualbox-iso" "debian12" {
  vm_name              = var.vm_name
  guest_os_type        = "Debian_64"
  iso_url              = var.iso_url
  iso_checksum         = var.iso_checksum
  ssh_username         = var.ssh_username
  ssh_password         = var.ssh_password
  ssh_timeout          = "40m"
  shutdown_command     = "echo '${var.ssh_password}' | sudo -S shutdown -P now"
  disk_size            = var.disk_size
  memory               = var.memory
  cpus                 = var.cpus
  headless             = false
  http_directory       = "http"
  output_directory     = "output-localdb-hub"

  boot_wait = "5s"

  # This boot command is intentionally conservative and may need adjustment depending on ISO.
  # For a production release, lock to a specific Debian ISO and validate the installer keystrokes.
  boot_command = [
    "<esc><wait>",
    "auto url=http://{{ .HTTPIP }}:{{ .HTTPPort }}/preseed.cfg ",
    "debian-installer=en_US auto locale=en_US kbd-chooser/method=us ",
    "hostname=localdb-hub domain=local ",
    "fb=false debconf/frontend=noninteractive ",
    "console-setup/ask_detect=false keyboard-configuration/xkb-keymap=us ",
    "<enter>"
  ]

  guest_additions_mode = "disable"
}

build {
  sources = ["source.virtualbox-iso.debian12"]

  provisioner "file" {
    source      = "../../.."
    destination = "/tmp/localdb-hub-src"
  }

  provisioner "shell" {
    inline = [
      "chmod +x /tmp/localdb-hub-src/deploy/vm/packer/scripts/install-localdb-hub.sh",
      "sudo /tmp/localdb-hub-src/deploy/vm/packer/scripts/install-localdb-hub.sh"
    ]
  }

  provisioner "shell" {
    inline = [
      "chmod +x /tmp/localdb-hub-src/deploy/vm/packer/scripts/firstboot-message.sh",
      "sudo /tmp/localdb-hub-src/deploy/vm/packer/scripts/firstboot-message.sh"
    ]
  }

  post-processor "shell-local" {
    inline = [
      "echo 'Build finished. Export the VM to OVA from VirtualBox if needed.'"
    ]
  }
}
