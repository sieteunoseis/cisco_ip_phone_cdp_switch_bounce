```markdown
# Cisco IP Phone Port Bouncer

## Description
This utility helps network engineers safely reboot Cisco IP phones by automating the process of port bouncing. The script performs the following steps:

1. Retrieves CDP (Cisco Discovery Protocol) information from a Cisco IP phone's web interface
2. Generates the necessary switch commands to:
   - Connect to the switch via SSH
   - Verify the correct port using CDP neighbors
   - Safely bounce (shutdown and no shutdown) the port

## Prerequisites
- Node.js (v14 or higher)
- SSH access to the network switches
- `sshpass` installed on your system
- Network access to Cisco IP phones

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cisco-phone-port-bouncer
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
DEVICE_USERNAME=your-switch-username
DEVICE_PASSWORD=your-switch-password
```

## Usage

1. Build the TypeScript code:
```bash
npm run build
```

2. Run the script with the IP address of the Cisco phone:
```bash
node dist/index.js -i <phone-ip-address>
```

Example:
```bash
node dist/index.js -i 10.72.70.10
```

The script will output three sections of information:
1. CDP neighbor device ID (switch hostname)
2. CDP neighbor IP address
3. Port information and commands to bounce the port

## Generated Commands Explained

The script generates commands in the following sequence:

1. **Switch Connection**:
   ```
   sshpass -p "password" ssh -o StrictHostKeyChecking=no username@switch
   ```
   Establishes SSH connection to the switch

2. **Port Verification**:
   ```
   show cdp neighbors <port>
   ```
   Verifies the phone is connected to the expected port

3. **Port Bounce**:
   ```
   config t
   interface <port>
   shut
   no shut
   ```
   Safely bounces the port to reboot the phone

## Security Notes
- Store credentials securely in the `.env` file
- Never commit the `.env` file to version control
- Ensure proper access controls are in place for switch management

## Error Handling
The script includes error handling for:
- Invalid IP addresses
- Network connectivity issues
- Invalid CDP information
- Failed SSH connections

## Contributing
Feel free to submit issues and enhancement requests.

## License
MIT License

## Disclaimer
Always verify the commands before executing them on production network equipment. This script is provided as-is with no warranties.