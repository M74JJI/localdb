variable "vm_name" {
  type    = string
  default = "localdb-hub-debian12"
}

variable "iso_url" {
  type    = string
  # Replace with a local ISO path or official Debian netinst ISO URL.
  default = "file:///path/to/debian-12-netinst.iso"
}

variable "iso_checksum" {
  type    = string
  # Replace with actual checksum, for example: sha256:<hash>
  default = "none"
}

variable "ssh_username" {
  type    = string
  default = "localdb"
}

variable "ssh_password" {
  type      = string
  default   = "localdb"
  sensitive = true
}

variable "disk_size" {
  type    = string
  default = "40000"
}

variable "memory" {
  type    = string
  default = "4096"
}

variable "cpus" {
  type    = string
  default = "2"
}
