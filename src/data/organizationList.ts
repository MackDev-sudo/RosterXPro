// List of top global IT companies with codes and details
export interface OrganizationInfo {
  name: string;
  code: string;
  country: string;
  description?: string;
}

export const organizations: OrganizationInfo[] = [
  // Indian-Origin IT Giants
  { name: 'TCS', code: 'TCS001', country: 'India', description: 'Tata Consultancy Services' },
  { name: 'Infosys', code: 'INF002', country: 'India' },
  { name: 'Wipro', code: 'WIP003', country: 'India' },
  { name: 'HCLTech', code: 'HCL004', country: 'India', description: 'HCL Technologies' },
  { name: 'Tech Mahindra', code: 'TM005', country: 'India' },
  { name: 'LTIMindtree', code: 'LTI006', country: 'India' },
  { name: 'Mphasis', code: 'MPH007', country: 'India' },
  { name: 'Persistent Systems', code: 'PER008', country: 'India' },
  { name: 'Birlasoft', code: 'BIR009', country: 'India' },
  { name: 'Zensar Technologies', code: 'ZEN010', country: 'India' },

  // US-Based IT Companies
  { name: 'IBM', code: 'IBM011', country: 'USA' },
  { name: 'Accenture', code: 'ACC012', country: 'Ireland/USA', description: 'HQ in Ireland, large US presence' },
  { name: 'Cognizant', code: 'COG013', country: 'USA' },
  { name: 'DXC Technology', code: 'DXC014', country: 'USA' },
  { name: 'Microsoft', code: 'MS015', country: 'USA' },
  { name: 'Google (Alphabet)', code: 'GOO016', country: 'USA' },
  { name: 'Amazon Web Services (AWS)', code: 'AWS017', country: 'USA' },
  { name: 'Oracle', code: 'ORA018', country: 'USA' },
  { name: 'Salesforce', code: 'SAL019', country: 'USA' },
  { name: 'ServiceNow', code: 'SN020', country: 'USA' },
  { name: 'Adobe Systems', code: 'ADB021', country: 'USA' },
  { name: 'VMware', code: 'VMW022', country: 'USA' },
  { name: 'Dell Technologies', code: 'DEL023', country: 'USA' },
  { name: 'HP Inc.', code: 'HPI024', country: 'USA' },
  { name: 'Hewlett Packard Enterprise (HPE)', code: 'HPE025', country: 'USA' },
  { name: 'Cisco Systems', code: 'CIS026', country: 'USA' },
  { name: 'Intuit', code: 'INT027', country: 'USA' },
  { name: 'Workday', code: 'WRK028', country: 'USA' },
  { name: 'Snowflake', code: 'SNF029', country: 'USA' },
  { name: 'Palantir Technologies', code: 'PAL030', country: 'USA' },

  // Europe-Based IT Companies
  { name: 'Capgemini', code: 'CAP031', country: 'France' },
  { name: 'Atos', code: 'ATO032', country: 'France' },
  { name: 'SAP', code: 'SAP033', country: 'Germany' },
  { name: 'Sopra Steria', code: 'SOP034', country: 'France' },
  { name: 'T-Systems', code: 'TSY035', country: 'Germany' },
  { name: 'Ericsson', code: 'ERI036', country: 'Sweden' },
  { name: 'Nokia', code: 'NOK037', country: 'Finland' },

  // Asia-Pacific & Other Regions
  { name: 'NTT Data', code: 'NTT038', country: 'Japan' },
  { name: 'Fujitsu', code: 'FUJ039', country: 'Japan' },
  { name: 'Hitachi Vantara', code: 'HIT040', country: 'Japan' },
  { name: 'NEC Corporation', code: 'NEC041', country: 'Japan' },
  { name: 'Alibaba Cloud', code: 'ALI042', country: 'China' },
  { name: 'Tencent Cloud', code: 'TEN043', country: 'China' },
  { name: 'Baidu AI Cloud', code: 'BAI044', country: 'China' },
  { name: 'Samsung SDS', code: 'SAM045', country: 'South Korea' },
  { name: 'LG CNS', code: 'LGC046', country: 'South Korea' },
];
