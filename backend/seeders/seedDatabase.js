const mongoose = require('mongoose');
const Category = require('../models/Category');
const Command = require('../models/Command');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pentesting');

const seedData = async () => {
  try {
    // Clear existing data
    await Category.deleteMany({});
    await Command.deleteMany({});

    // Create categories
    const generalCategory = await Category.create({
      name: 'General Penetration Testing',
      type: 'General',
      description: 'Common commands used across all types of penetration testing',
      order: 0,
      isDefault: true
    });

    const webAppCategory = await Category.create({
      name: 'Web Application Testing',
      type: 'Web Application',
      description: 'Commands for testing web applications',
      order: 1,
      isDefault: true
    });

    const internalNetCategory = await Category.create({
      name: 'Internal Network Testing',
      type: 'Internal Network',
      description: 'Commands for internal network penetration testing',
      order: 2,
      isDefault: true
    });

    const externalNetCategory = await Category.create({
      name: 'External Network Testing',
      type: 'External Network',
      description: 'Commands for external network penetration testing',
      order: 3,
      isDefault: true
    });

    // General Commands (used across all penetration testing types)
    const generalCommands = [
      {
        name: 'Basic Nmap Scan',
        command: 'nmap -sC -sV {domain}',
        description: 'Standard Nmap scan with script scanning and version detection',
        category: generalCategory._id,
        phase: 'Reconnaissance',
        tags: ['nmap', 'reconnaissance', 'scanning'],
        order: 0
      },
      {
        name: 'Full Port Scan',
        command: 'nmap -p- -T4 {domain}',
        description: 'Scan all 65535 ports',
        category: generalCategory._id,
        phase: 'Scanning',
        tags: ['nmap', 'ports', 'comprehensive'],
        order: 0
      },
      {
        name: 'DNS Enumeration',
        command: 'dig {domain} ANY +noall +answer',
        description: 'DNS record enumeration',
        category: generalCategory._id,
        phase: 'Reconnaissance',
        tags: ['dns', 'enumeration', 'dig'],
        order: 1
      },
      {
        name: 'Subdomain Discovery',
        command: 'subfinder -d {domain} -silent',
        description: 'Passive subdomain enumeration',
        category: generalCategory._id,
        phase: 'Reconnaissance',
        tags: ['subdomains', 'reconnaissance', 'subfinder'],
        order: 2
      },
      {
        name: 'Whois Lookup',
        command: 'whois {domain}',
        description: 'Domain registration information',
        category: generalCategory._id,
        phase: 'Reconnaissance',
        tags: ['whois', 'osint', 'information'],
        order: 3
      },
      {
        name: 'Ping Sweep',
        command: 'nmap -sn {domain}/24',
        description: 'Discover live hosts in network range',
        category: generalCategory._id,
        phase: 'Scanning',
        tags: ['nmap', 'ping', 'discovery'],
        order: 1
      },
      {
        name: 'Service Version Detection',
        command: 'nmap -sV -p- {domain}',
        description: 'Detailed service version detection on all ports',
        category: generalCategory._id,
        phase: 'Enumeration',
        tags: ['nmap', 'services', 'versions'],
        order: 0
      },
      {
        name: 'TCP Connect Scan',
        command: 'nmap -sT {domain}',
        description: 'TCP connect scan (no SYN packets)',
        category: generalCategory._id,
        phase: 'Scanning',
        tags: ['nmap', 'tcp', 'stealth'],
        order: 2
      }
    ];

    // Web Application Commands
    const webCommands = [
      {
        name: 'Nmap Web Scan',
        command: 'nmap -sC -sV -p 80,443 {domain}',
        description: 'Basic web port scan with service detection',
        category: webAppCategory._id,
        phase: 'Scanning',
        tags: ['nmap', 'web', 'ports'],
        order: 0
      },
      {
        name: 'Gobuster Directory Scan',
        command: 'gobuster dir -u http://{domain} -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt',
        description: 'Directory and file enumeration',
        category: webAppCategory._id,
        phase: 'Enumeration',
        tags: ['gobuster', 'directories', 'enumeration'],
        order: 0
      },
      {
        name: 'Nikto Web Scan',
        command: 'nikto -h {domain}',
        description: 'Web server vulnerability scanner',
        category: webAppCategory._id,
        phase: 'Scanning',
        tags: ['nikto', 'vulnerability', 'web'],
        order: 1
      },
      {
        name: 'SSL Labs Test',
        command: 'curl -s "https://api.ssllabs.com/api/v3/analyze?host={domain}&publish=off"',
        description: 'SSL/TLS security assessment',
        category: webAppCategory._id,
        phase: 'Scanning',
        tags: ['ssl', 'tls', 'security'],
        order: 2
      }
    ];

    // Internal Network Commands
    const internalCommands = [
      {
        name: 'Internal Network Discovery',
        command: 'nmap -sn 192.168.1.0/24',
        description: 'Discover live hosts on internal network',
        category: internalNetCategory._id,
        phase: 'Reconnaissance',
        tags: ['nmap', 'discovery', 'internal'],
        order: 0
      },
      {
        name: 'SMB Enumeration',
        command: 'enum4linux {domain}',
        description: 'SMB and NetBIOS enumeration',
        category: internalNetCategory._id,
        phase: 'Enumeration',
        tags: ['smb', 'netbios', 'enum4linux'],
        order: 0
      },
      {
        name: 'Internal Port Scan',
        command: 'nmap -sS -A -T4 {domain}',
        description: 'Comprehensive internal port scan',
        category: internalNetCategory._id,
        phase: 'Scanning',
        tags: ['nmap', 'ports', 'stealth'],
        order: 0
      }
    ];

    // External Network Commands
    const externalCommands = [
      {
        name: 'DNS Enumeration',
        command: 'dnsrecon -d {domain}',
        description: 'DNS record enumeration',
        category: externalNetCategory._id,
        phase: 'Reconnaissance',
        tags: ['dns', 'reconnaissance', 'dnsrecon'],
        order: 0
      },
      {
        name: 'Subdomain Enumeration',
        command: 'subfinder -d {domain}',
        description: 'Passive subdomain discovery',
        category: externalNetCategory._id,
        phase: 'Reconnaissance',
        tags: ['subdomains', 'passive', 'subfinder'],
        order: 1
      },
      {
        name: 'WHOIS Lookup',
        command: 'whois {domain}',
        description: 'Domain registration information',
        category: externalNetCategory._id,
        phase: 'Reconnaissance',
        tags: ['whois', 'domain', 'osint'],
        order: 2
      },
      {
        name: 'External Port Scan',
        command: 'nmap -sS -O -sV -T4 {domain}',
        description: 'External network port scan with OS detection',
        category: externalNetCategory._id,
        phase: 'Scanning',
        tags: ['nmap', 'external', 'os-detection'],
        order: 0
      }
    ];

    // Insert commands
    await Command.insertMany([...generalCommands, ...webCommands, ...internalCommands, ...externalCommands]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
