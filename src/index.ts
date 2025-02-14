import dotenv from 'dotenv';
import { program } from 'commander';

// Load environment variables
dotenv.config();

interface DeviceInfo {
    deviceID: string;
    ipAddress: string;
    port: string;
    configString: string;
}

function decodeHtmlEntities(text: string): string {
    return text.replace(/&#x2F;/g, '/').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function parseDeviceStatistics(htmlContent: string): DeviceInfo {
    const deviceInfo: DeviceInfo = {
        deviceID: '',
        ipAddress: '',
        port: '',
        configString: ''
    };

    const deviceIDMatch = htmlContent.match(/CDP Neighbor device ID<\/B><\/TD><td[^>]*><\/TD><TD><B>([^<]+)<\/B>/);
    const ipAddressMatch = htmlContent.match(/CDP Neighbor IP address<\/B><\/TD><td[^>]*><\/TD><TD><B>([^<]+)<\/B>/);
    const portMatch = htmlContent.match(/CDP Neighbor port<\/B><\/TD><td[^>]*><\/TD><TD><B>([^<]+)<\/B>/);

    if (deviceIDMatch) deviceInfo.deviceID = deviceIDMatch[1];
    if (ipAddressMatch) deviceInfo.ipAddress = ipAddressMatch[1];
    if (portMatch) {
        deviceInfo.port = decodeHtmlEntities(portMatch[1]);
        // Use environment variables for credentials
        deviceInfo.configString = `sshpass -p "${process.env.DEVICE_PASSWORD}" ssh -o StrictHostKeyChecking=no ${process.env.DEVICE_USERNAME}@${deviceInfo.deviceID}\nshow cdp neighbors ${deviceInfo.port}\nconfig t\ninterface ${deviceInfo.port}\nshut\nno shut`;
    }

    return deviceInfo;
}

async function getDeviceInfo(ipAddress: string): Promise<DeviceInfo> {
    try {
        const url = `http://${ipAddress}/CGI/Java/Serviceability?adapter=device.statistics.port.network`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'text/html',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const htmlContent = await response.text();
        return parseDeviceStatistics(htmlContent);
    } catch (error) {
        console.error('Error fetching device statistics:', error);
        throw error;
    }
}

// CLI setup
program
    .version('1.0.0')
    .requiredOption('-i, --ip <address>', 'IP address of the device')
    .parse(process.argv);

const options = program.opts();

// Execute with CLI argument
getDeviceInfo(options.ip)
    .then(info => {
        console.log('CDP Neighbor device ID:', info.deviceID);
        console.log('CDP Neighbor IP address:', info.ipAddress);
        console.log('CDP Neighbor port:', info.port);
        console.log('\nConfiguration commands:');
        console.log(info.configString);
        console.log('end');
        console.log('exit');
        console.log('\n');
    })
    .catch(error => {
        console.error('Failed to fetch device info:', error);
    });