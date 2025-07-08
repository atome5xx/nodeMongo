provider "azurerm" {
  features {}
  subscription_id = "2f982fe1-7206-421f-abcd-b7575cbd9185"
}

variable "location" {
  default = "francecentral"
}

variable "resource_group_name" {
  default = "SDFORM"
}

variable "admin_username" {
  default = "admin_sd"
}

variable "admin_password" {
  default = "ChangeMe123!" # ⚠️ À remplacer par un mot de passe sécurisé via une variable de type secret
}

# Groupe de ressources
resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    environment = "dev"
  }
}

# Réseau virtuel
resource "azurerm_virtual_network" "vnet" {
  name                = "VM-ADDS-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name

  tags = {
    environment = "dev"
  }
}

# Sous-réseau
resource "azurerm_subnet" "subnet" {
  name                 = "default"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.0.0/24"]
}

# IP publique
resource "azurerm_public_ip" "public_ip" {
  name                = "VM-ADDS-ip"
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name
  allocation_method   = "Static"
  sku                 = "Basic"

  tags = {
    environment = "dev"
  }
}

# Groupe de sécurité réseau (NSG)
resource "azurerm_network_security_group" "nsg" {
  name                = "VM-ADDS-nsg"
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name

  tags = {
    environment = "dev"
  }
}

# Règle RDP (optionnelle)
resource "azurerm_network_security_rule" "rdp" {
  name                        = "Allow-RDP"
  priority                    = 100
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "3389"
  source_address_prefix       = "*"
  destination_address_prefix  = "*"
  resource_group_name         = azurerm_resource_group.rg.name
  network_security_group_name = azurerm_network_security_group.nsg.name
}

# Règle SSH
resource "azurerm_network_security_rule" "ssh" {
  name                        = "Allow-SSH"
  priority                    = 101
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "22"
  source_address_prefix       = "*"
  destination_address_prefix  = "*"
  resource_group_name         = azurerm_resource_group.rg.name
  network_security_group_name = azurerm_network_security_group.nsg.name
}

# Règle Node.js (port 3000)
resource "azurerm_network_security_rule" "node" {
  name                        = "Allow-NodeJS"
  priority                    = 110
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "3000"
  source_address_prefix       = "*"
  destination_address_prefix  = "*"
  resource_group_name         = azurerm_resource_group.rg.name
  network_security_group_name = azurerm_network_security_group.nsg.name
}

# Interface réseau
resource "azurerm_network_interface" "nic" {
  name                = "vm-adds-nic"
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name

  ip_configuration {
    name                          = "ipconfig1"
    subnet_id                     = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.public_ip.id
  }

  tags = {
    environment = "dev"
  }
}

# Association NSG → NIC
resource "azurerm_network_interface_security_group_association" "nic_nsg" {
  network_interface_id      = azurerm_network_interface.nic.id
  network_security_group_id = azurerm_network_security_group.nsg.id
}

# Machine virtuelle Linux (Ubuntu)
resource "azurerm_linux_virtual_machine" "vm" {
  name                             = "VM-ADDS"
  resource_group_name              = azurerm_resource_group.rg.name
  location                         = var.location
  size                             = "Standard_B2s"
  admin_username                   = var.admin_username
  admin_password                   = var.admin_password
  disable_password_authentication = false
  network_interface_ids            = [azurerm_network_interface.nic.id]

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "StandardSSD_LRS"
    disk_size_gb         = 127
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-focal"
    sku       = "20_04-lts"
    version   = "latest"
  }

  custom_data = base64encode(file("${path.module}/cloud-init.sh"))

  tags = {
    environment = "dev"
  }
}

# Output : IP publique
output "vm_public_ip" {
  description = "Adresse IP publique de la VM"
  value       = azurerm_public_ip.public_ip.ip_address
}
