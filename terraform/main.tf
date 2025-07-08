provider "azurerm" {
  features {}
}

variable "resource_group_name" {
  type    = string
  default = "SDFORM"
}

variable "location" {
  type    = string
  default = "francecentral"
}

variable "vm_name" {
  type    = string
  default = "VM-ADDS"
}

variable "os_disk_id" {
  type = string
  default = "/subscriptions/2f982fe1-7206-421f-abcd-b7575cbd9185/resourceGroups/SDFORM/providers/Microsoft.Compute/disks/VM-ADDS_OsDisk_1_91f0471096c14d24b07aa326af76f4ff"
}

variable "network_interface_id" {
  type = string
  default = "/subscriptions/2f982fe1-7206-421f-abcd-b7575cbd9185/resourceGroups/SDFORM/providers/Microsoft.Network/networkInterfaces/vm-adds676"
}

resource "azurerm_windows_virtual_machine" "vm_adds" {
  name                = var.vm_name
  resource_group_name = var.resource_group_name
  location            = var.location
  size                = "Standard_B2s"
  admin_username      = "admin_sd"
  admin_password      = "ChangeMe123!"  # ⚠️ À stocker dans un fichier .tfvars ou Vault en prod

  network_interface_ids = [
    var.network_interface_id
  ]

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "StandardSSD_LRS"
    managed_disk_id      = var.os_disk_id
    disk_size_gb         = 127
  }

  source_image_reference {
    publisher = "MicrosoftWindowsServer"
    offer     = "WindowsServer"
    sku       = "2022-datacenter-azure-edition"
    version   = "latest"
  }

  os_profile_windows_config {
    provision_vm_agent             = true
    enable_automatic_upgrades     = true
    patch_mode                     = "AutomaticByOS"
    allow_extension_operations     = true
    require_guest_provision_signal = true
  }

  security_type = "TrustedLaunch"

  boot_diagnostics {
    enabled = true
  }
}

# === NSG for allowing Node.js on port 3000 ===

resource "azurerm_network_security_group" "main_nsg" {
  name                = "vm-adds-nsg"
  location            = var.location
  resource_group_name = var.resource_group_name
}

resource "azurerm_network_security_rule" "allow_node_3000" {
  name                        = "AllowAnyCustom3000Inbound"
  priority                    = 110
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "*"
  source_port_range           = "*"
  destination_port_range      = "3000"
  source_address_prefix       = "*"
  destination_address_prefix  = "*"
  resource_group_name         = var.resource_group_name
  network_security_group_name = azurerm_network_security_group.main_nsg.name
  description                 = "Autorise l'accès HTTP pour Node.js sur le port 3000"
}

resource "azurerm_network_interface_security_group_association" "nsg_assoc" {
  network_interface_id      = var.network_interface_id
  network_security_group_id = azurerm_network_security_group.main_nsg.id
}
