const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const learningStore = require('./learningStore');

async function parseResume(filePath, ext) {
  let rawText = '';

  if (ext === '.pdf') {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    rawText = data.text;
  } else if (ext === '.docx' || ext === '.doc') {
    const result = await mammoth.extractRawText({ path: filePath });
    rawText = result.value;
  } else {
    throw new Error('Unsupported file format');
  }

  console.log('=== RAW TEXT FROM PDF ===');
  console.log(rawText);
  console.log('=== END RAW TEXT ===');

  // Track parse count for learning stats
  learningStore.recordParsed();

  return extractSections(rawText);
}

// ===== MASSIVE KNOWN DATABASES =====

const KNOWN_COMPANIES = new Set([
  // Indian IT Services
  'tcs', 'tata consultancy services', 'infosys', 'wipro', 'hcl', 'hcl technologies',
  'tech mahindra', 'mindtree', 'mphasis', 'l&t infotech', 'lti', 'ltimindtree',
  'persistent systems', 'persistent', 'zensar', 'zensar technologies', 'hexaware',
  'hexaware technologies', 'niit', 'niit technologies', 'cyient', 'birlasoft',
  'coforge', 'larsen & toubro', 'l&t', 'sonata software', 'mastek', 'mphasis',
  'firstsource', 'css corp', 'igate', 'patni', 'polaris', 'sasken', 'subex',
  'tata elxsi', 'kpit technologies', 'kpit', 'happiest minds', 'newgen software',
  'oracle financial services', 'rolta', 'geometric', 'amdocs', 'syntel',
  'cognizant', 'cognizant technology solutions', 'accenture', 'capgemini',
  'atos', 'dxc technology', 'unisys', 'ntt data', 'microland', 'kellton tech',
  'aspire systems', 'thoughtworks', 'publicis sapient', 'sapient', 'xoriant',
  'globant', 'epam', 'endurance technologies', 'quess corp',

  // Indian Startups / Unicorns
  'juspay', 'juspay technologies', 'zestmoney', 'cred', 'razorpay', 'paytm',
  'phonepe', 'bharatpe', 'groww', 'zerodha', 'swiggy', 'zomato', 'flipkart',
  'meesho', 'ola', 'ola cabs', 'ola electric', 'uber india',
  "byju's", 'byjus', 'unacademy', 'upgrad', 'vedantu', 'whitehat jr',
  'cars24', 'cardekho', 'lenskart', 'nykaa', 'dunzo', 'urban company',
  'urbanclap', 'practo', 'policybazaar', 'makemytrip', 'yatra', 'oyo',
  'oyo rooms', 'treebo', 'fabhotels', 'rapido', 'bounce', 'vogo',
  'delhivery', 'shiprocket', 'rivigo', 'blackbuck', 'licious', 'bigbasket',
  'blinkit', 'grofers', 'zepto', 'jiomart', 'reliance retail',
  'udaan', 'moglix', 'ofbusiness', 'infra.market', 'dealshare',
  'slice', 'jupiter', 'fi', 'niyo', 'epifi', 'smallcase', 'kuvera',
  'coin dcx', 'wazirx', 'coindcx', 'instamojo', 'pine labs', 'mswipe',
  'bharat pay', 'cashfree', 'simpl', 'lazypay', 'zeta', 'open financial',
  'khatabook', 'okcredit', 'vyapar', 'tally', 'tally solutions', 'zoho',
  'zoho corp', 'freshworks', 'freshdesk', 'chargebee', 'clevertap',
  'moengage', 'webengage', 'netcore', 'leadsquared', 'whatfix',
  'browserstack', 'postman', 'hasura', 'druva', 'icertis',
  'highradius', 'darwinbox', 'mindtickle', 'yellowai', 'yellow.ai',
  'uniphore', 'observe.ai', 'gupshup', 'haptik', 'niki.ai',
  'sharechat', 'dailyhunt', 'verse innovation', 'glance', 'inmobi',
  'media.net', 'criteo india', 'dream11', 'dream sports', 'mpl',
  'mobile premier league', 'games24x7', 'winzo', 'my11circle',
  'cure.fit', 'curefit', 'cult.fit', 'healthifyme', 'pharmeasy',
  'netmeds', '1mg', 'tata 1mg', 'medlife', 'apollo pharmacy',
  'spinny', 'park+', 'fashinza', 'zilingo', 'myntra', 'ajio',
  'firstcry', 'mamaearth', 'sugar cosmetics', 'plum', 'boat',
  'noise', 'fire-boltt', 'atomberg', 'wakefit', 'pepperfry',
  'furlenco', 'rentomojo', 'quikr', 'olx india', 'nobroker',
  'housing.com', 'magicbricks', '99acres', 'square yards',
  'ixigo', 'cleartrip', 'goibibo', 'easemytrip', 'abhibus',
  'redbus', 'shuttl', 'moovit india', 'porter', 'lalamove india',
  'rivian india', 'ather energy', 'hero electric', 'revolt motors',
  'simple energy', 'euler motors', 'bluSmart', 'chalo',
  'apna', 'hirist', 'naukri', 'monster india', 'shine',
  'internshala', 'hacker earth', 'hackerrank india', 'codechef', 'coding ninjas',
  'scaler', 'interviewbit', 'geeksforgeeks', 'pepcoding',
  'toppr', 'doubtnut', 'testbook', 'gradeup', 'embibe',
  'classplus', 'teachmint', 'extramarks', 'lead school',
  'eruditus', 'great learning', 'simplilearn', 'edureka',
  'jio', 'reliance jio', 'airtel', 'bharti airtel', 'vodafone idea', 'vi',
  'bsnl', 'mtnl', 'tata communications', 'sterlite technologies',

  // Indian Consulting / Finance
  'mckinsey', 'mckinsey & company', 'bcg', 'boston consulting group',
  'bain', 'bain & company', 'deloitte', 'kpmg', 'ey', 'ernst & young',
  'pwc', 'pricewaterhousecoopers', 'a.t. kearney', 'kearney',
  'oliver wyman', 'roland berger', 'strategy&', 'monitor deloitte',
  'parthenon', 'leh', 'alvarez & marsal', 'zs associates', 'zs',
  'goldman sachs', 'jp morgan', 'jpmorgan', 'jpmorgan chase',
  'morgan stanley', 'barclays', 'deutsche bank', 'hsbc',
  'citibank', 'citi', 'citigroup', 'credit suisse', 'ubs',
  'bnp paribas', 'societe generale', 'nomura', 'macquarie',
  'standard chartered', 'rbs', 'natwest', 'wells fargo',
  'bank of america', 'bofa', 'merrill lynch',
  'icici', 'icici bank', 'hdfc', 'hdfc bank', 'hdfc life',
  'kotak', 'kotak mahindra', 'kotak mahindra bank',
  'axis bank', 'sbi', 'state bank of india', 'rbi',
  'reserve bank of india', 'sebi', 'lic', 'bajaj finance',
  'bajaj finserv', 'bajaj allianz', 'aditya birla capital',
  'idfc first bank', 'yes bank', 'indusind bank', 'federal bank',
  'bandhan bank', 'au small finance bank', 'ujjivan', 'equitas',
  'iifl', 'motilal oswal', 'angel one', 'angel broking',
  'sharekhan', 'upstox', '5paisa', 'edelweiss', 'jm financial',
  'kotak securities', 'icici securities', 'hdfc securities',
  'avendus', 'edelweiss', 'lazard india', 'rothschild india',

  // Indian FMCG / Manufacturing / Conglomerates
  'hul', 'hindustan unilever', 'p&g', 'procter & gamble',
  'itc', 'itc limited', 'nestle', 'nestle india', 'colgate',
  'colgate palmolive', 'marico', 'dabur', 'godrej', 'godrej consumer',
  'godrej industries', 'emami', 'britannia', 'parle', 'amul',
  'mother dairy', 'haldirams', 'patanjali', 'himalaya',
  'asian paints', 'berger paints', 'pidilite', 'fevicol',
  'tata', 'tata group', 'tata motors', 'tata steel', 'tata power',
  'tata chemicals', 'titan', 'tanishq', 'tata digital',
  'reliance', 'reliance industries', 'ril', 'reliance digital',
  'adani', 'adani group', 'adani enterprises', 'adani ports',
  'adani power', 'adani green', 'adani wilmar',
  'mahindra', 'mahindra & mahindra', 'm&m', 'tech mahindra',
  'bajaj', 'bajaj auto', 'hero', 'hero motocorp',
  'maruti', 'maruti suzuki', 'hyundai india', 'toyota india',
  'honda india', 'tvs motor', 'ashok leyland',
  'larsen & toubro', 'l&t', 'siemens india', 'abb india',
  'bhel', 'gail', 'ongc', 'iocl', 'bpcl', 'hpcl',
  'ntpc', 'powergrid', 'coal india', 'vedanta', 'hindalco',
  'jsw steel', 'jsw group', 'aditya birla group', 'grasim',
  'ultratech cement', 'ambuja cements', 'acc', 'dalmia bharat',
  'sun pharma', 'cipla', 'dr reddys', "dr. reddy's", 'lupin',
  'aurobindo pharma', 'divis labs', 'biocon', 'glenmark',
  'torrent pharma', 'cadila', 'zydus', 'alkem', 'ipca labs',

  // Global Tech Giants
  'google', 'alphabet', 'amazon', 'aws', 'amazon web services',
  'microsoft', 'meta', 'facebook', 'apple', 'netflix',
  'uber', 'airbnb', 'stripe', 'salesforce', 'oracle',
  'sap', 'adobe', 'vmware', 'broadcom', 'cisco', 'intel',
  'qualcomm', 'samsung', 'nvidia', 'amd', 'arm', 'ibm',
  'dell', 'hp', 'hewlett packard', 'hpe', 'lenovo', 'asus',
  'twitter', 'x corp', 'snap', 'snapchat', 'pinterest',
  'linkedin', 'reddit', 'spotify', 'dropbox', 'slack',
  'zoom', 'atlassian', 'jira', 'confluence', 'twilio',
  'snowflake', 'databricks', 'palantir', 'splunk', 'elastic',
  'cloudflare', 'datadog', 'hashicorp', 'confluent', 'mongodb',
  'cockroach labs', 'redis labs', 'neo4j', 'couchbase',
  'github', 'gitlab', 'bitbucket', 'vercel', 'netlify',
  'heroku', 'digitalocean', 'linode', 'vultr', 'rackspace',
  'shopify', 'square', 'block', 'robinhood', 'coinbase',
  'binance', 'kraken', 'plaid', 'brex', 'ramp', 'chime',
  'sofi', 'affirm', 'klarna', 'adyen', 'wise', 'revolut',
  'doordash', 'instacart', 'grubhub', 'lyft', 'grab',
  'gojek', 'sea group', 'shopee', 'lazada', 'tokopedia',
  'bytedance', 'tiktok', 'tencent', 'alibaba', 'baidu', 'jd.com',
  'booking.com', 'expedia', 'tripadvisor', 'kayak',
  'tesla', 'spacex', 'waymo', 'cruise', 'rivian', 'lucid',
  'epic games', 'roblox', 'unity', 'ea', 'electronic arts',
  'activision', 'blizzard', 'riot games', 'valve',
  'paypal', 'ebay', 'etsy', 'wayfair', 'chewy',
  'workday', 'servicenow', 'okta', 'palo alto networks',
  'crowdstrike', 'zscaler', 'fortinet', 'fireeye', 'mandiant',
  'mcafee', 'norton', 'symantec', 'checkpoint',
  'nutanix', 'pure storage', 'netapp', 'commvault',
  'autodesk', 'ansys', 'cadence', 'synopsys', 'mentor graphics',
  'tableau', 'power bi', 'looker', 'domo', 'sisense',
  'hubspot', 'zendesk', 'intercom', 'freshworks', 'zoho',
  'docusign', 'box', 'notion', 'asana', 'monday.com', 'clickup',
  'figma', 'canva', 'miro', 'invision', 'sketch',
  'twitch', 'discord', 'signal', 'telegram',
  'akamai', 'fastly', 'imperva', 'f5 networks',
  'arista networks', 'juniper networks', 'extreme networks',
  'ge', 'general electric', 'honeywell', 'emerson', '3m',
  'caterpillar', 'john deere', 'boeing', 'lockheed martin',
  'raytheon', 'northrop grumman', 'bae systems',
  'johnson & johnson', 'j&j', 'pfizer', 'moderna', 'abbott',
  'medtronic', 'stryker', 'boston scientific', 'ge healthcare',
  'philips', 'siemens healthineers',
  'mckinsey digital', 'bcg platinion', 'deloitte digital',
  'accenture strategy', 'tiger global', 'sequoia', 'softbank',
  'peak xv', 'elevation capital', 'matrix partners',
  'nexus venture partners', 'blume ventures', 'kalaari capital',
  'accel', 'lightspeed', 'bessemer', 'general catalyst',
  'andreessen horowitz', 'a16z', 'kleiner perkins', 'greylock',
  'benchmark', 'insight partners', 'warburg pincus', 'kkr',
  'blackstone', 'carlyle', 'baring pe', 'advent international',
]);

const KNOWN_INSTITUTIONS = new Set([
  // IITs
  'iit', 'iit delhi', 'iit bombay', 'iit madras', 'iit kanpur',
  'iit kharagpur', 'iit roorkee', 'iit guwahati', 'iit bhu',
  'iit varanasi', 'iit hyderabad', 'iit indore', 'iit mandi',
  'iit patna', 'iit bhubaneswar', 'iit jodhpur', 'iit gandhinagar',
  'iit ropar', 'iit tirupati', 'iit dhanbad', 'iit ism',
  'iit palakkad', 'iit goa', 'iit jammu', 'iit dharwad',
  'iit bhilai',

  // IIMs
  'iim', 'iim ahmedabad', 'iim bangalore', 'iim calcutta',
  'iim lucknow', 'iim indore', 'iim kozhikode', 'iim shillong',
  'iim trichy', 'iim tiruchirappalli', 'iim ranchi', 'iim raipur',
  'iim rohtak', 'iim kashipur', 'iim udaipur', 'iim nagpur',
  'iim amritsar', 'iim bodh gaya', 'iim sambalpur', 'iim sirmaur',
  'iim visakhapatnam', 'iim jammu', 'iim mumbai',

  // NITs
  'nit', 'nit trichy', 'nit tiruchirappalli', 'nit warangal',
  'nit surathkal', 'nit calicut', 'nit allahabad', 'nit rourkela',
  'nit jaipur', 'nit nagpur', 'nit bhopal', 'nit durgapur',
  'nit silchar', 'nit hamirpur', 'nit kurukshetra', 'nit srinagar',
  'nit surat', 'nit agartala', 'nit raipur', 'nit patna',
  'nit jamshedpur', 'nit delhi', 'nit goa', 'nit meghalaya',
  'nit manipur', 'nit mizoram', 'nit arunachal pradesh',
  'nit nagaland', 'nit sikkim', 'nit uttarakhand', 'nit puducherry',
  'mnit jaipur', 'mnnit allahabad', 'vnit nagpur', 'svnit surat',
  'manit bhopal',

  // IIITs
  'iiit', 'iiit hyderabad', 'iiith', 'iiit allahabad',
  'iiit bangalore', 'iiitb', 'iiit delhi', 'iiitd',
  'iiit gwalior', 'iiit jabalpur', 'iiit kancheepuram',
  'iiit sri city', 'iiit lucknow', 'iiit vadodara',
  'iiit pune', 'iiit nagpur', 'iiit ranchi', 'iiit sonepat',
  'iiit una', 'iiit kalyani', 'iiit dharwad', 'iiit kota',
  'iiit manipur', 'iiit tiruchirappalli', 'iiit raichur',
  'iiit bhagalpur', 'iiit bhopal', 'iiit surat', 'iiit agartala',

  // IISc / IISERs
  'iisc', 'iisc bangalore', 'indian institute of science',
  'iiser', 'iiser pune', 'iiser bhopal', 'iiser mohali',
  'iiser kolkata', 'iiser thiruvananthapuram', 'iiser tirupati',
  'iiser berhampur',

  // Top B-Schools
  'fms', 'fms delhi', 'faculty of management studies',
  'xlri', 'xlri jamshedpur', 'isb', 'isb hyderabad',
  'indian school of business', 'iift', 'iift delhi',
  'indian institute of foreign trade',
  'mdi', 'mdi gurgaon', 'management development institute',
  'spjimr', 'sp jain', 'nmims', 'nmims mumbai',
  'sibm', 'sibm pune', 'symbiosis', 'symbiosis institute',
  'tiss', 'tiss mumbai', 'tata institute of social sciences',
  'jbims', 'jamnalal bajaj', 'imt', 'imt ghaziabad',
  'tapmi', 'tapmi manipal', 'great lakes', 'great lakes chennai',
  'fore school', 'fore school of management',
  'lbsim', 'kj somaiya', 'welingkar', 'gim goa',
  'irma', 'irma anand', 'mica', 'mica ahmedabad',
  'iift kolkata', 'narsee monjee', 'bits school of management',
  'ximb', 'xim bhubaneswar', 'xub', 'xiss ranchi',
  'imi delhi', 'imi new delhi', 'bimtech', 'jaipuria',
  'lbs', 'london business school', 'insead',

  // Top Universities
  'delhi university', 'du', 'university of delhi',
  'mumbai university', 'university of mumbai',
  'jadavpur university', 'ju', 'calcutta university',
  'university of calcutta', 'anna university',
  'osmania university', 'jntu', 'jntuh', 'jntuk',
  'pune university', 'savitribai phule pune university', 'sppu',
  'madras university', 'university of madras',
  'bombay university', 'bangalore university',
  'hyderabad university', 'university of hyderabad',
  'jnu', 'jawaharlal nehru university',
  'bhu', 'banaras hindu university',
  'amu', 'aligarh muslim university',
  'jamia millia islamia', 'jamia',
  'presidency university', 'presidency college',
  'st xaviers', "st. xavier's", 'st stephens', "st. stephen's",
  'loyola college', 'madras christian college',
  'hindu college', 'hansraj college', 'srcc',
  'shri ram college of commerce', 'lsr', 'lady shri ram',
  'miranda house', 'kirori mal', 'ramjas', 'daulat ram',
  'gargi college', 'ip college', 'deshbandhu college',
  'guru gobind singh', 'ambedkar university',
  'christ university', 'christ bangalore',
  'amity university', 'amity', 'lovely professional university', 'lpu',
  'chitkara university', 'chandigarh university',
  'shiv nadar university', 'ashoka university',
  'op jindal', 'flame university', 'krea university',
  'azim premji university', 'iim bangalore pgsem',
  'thapar university', 'thapar', 'pec chandigarh',
  'dtu', 'delhi technological university', 'dce',
  'nsit', 'netaji subhas', 'nsut', 'iiitd',
  'rvce', 'rv college', 'bms college', 'bmsce',
  'pes university', 'pes', 'pesu', 'msrit', 'ms ramaiah',
  'nitte meenakshi', 'dayananda sagar', 'sit',
  'sjce', 'sri jayachamarajendra', 'nie mysore',
  'uvce', 'bangalore institute of technology', 'bit',
  'coep', 'college of engineering pune', 'vjti',
  'veermata jijabai', 'spit', 'sardar patel',
  'dj sanghvi', 'kjsce', 'kj somaiya engineering',
  'thadomal shahani', 'mukesh patel', 'mpstme',
  'ict mumbai', 'udct', 'uict',
  'iiest shibpur', 'besu', 'indian engineering',
  'heritage institute', 'techno india', 'rcciit',
  'jis college', 'narula institute', 'meghnad saha',
  'cet trivandrum', 'nssce', 'mace', 'gec thrissur',
  'model engineering', 'toc h', 'rajagiri',
  'psg tech', 'psg college', 'kongu engineering',
  'sri sivasubramaniya nadar', 'ssn', 'ssnce',
  'ceg', 'college of engineering guindy', 'mit anna university',
  'madras institute of technology', 'sastra',
  'nit trichy', 'thiagarajar', 'tce', 'kamaraj college',
  'mepco schlenk', 'gct coimbatore',
  'birla institute', 'bits pilani', 'bits', 'bits goa',
  'bits hyderabad', 'bits dubai',
  'vit', 'vit vellore', 'vit chennai', 'vit bhopal',
  'srm', 'srm university', 'srm chennai', 'srmist',
  'manipal', 'manipal university', 'manipal institute',
  'mit manipal', 'mahe',
  'kiit', 'kiit university', 'kalinga institute',
  'soa university', 'siksha o anusandhan',
  'cochin university', 'cusat',
  'dhirubhai ambani', 'daiict',
  'iiitm gwalior', 'abv iiitm',
  'motilal nehru', 'mnnit',
  'hbti', 'hbtu kanpur',
  'ismu dhanbad', 'ism dhanbad',
  'nitie', 'nitie mumbai',

  // Schools / Boards
  'cbse', 'icse', 'isc', 'state board', 'cisce',
  'kendriya vidyalaya', 'kv', 'navodaya vidyalaya', 'jnv',
  'dps', 'delhi public school', 'dav', 'dav public school',
  'ryan international', 'vibgyor', 'podar', 'arya vidya mandir',
  'cathedral school', 'campion school', 'don bosco',
  'la martiniere', 'st columba', "st. columba's",
  'modern school', 'the doon school', 'doon school',
  'mayo college', 'scindia school', 'welham',
  'bishops school', "bishop's school", 'baldwins',
  'national public school', 'nps', 'valley school',
  'rishi valley', 'the heritage school', 'heritage school',
  'amity school', 'gd goenka', 'lotus valley',
  'pathways school', 'step by step', 'shri ram school',
  'sanskriti school', 'mother international', 'tagore international',
  'springdales', 'bal bharati', 'ahlcon',
  'army public school', 'aps', 'air force school',
  'navy children school', 'sainik school',
  'jawahar navodaya', 'atomic energy central school', 'aecs',

  // Global Universities
  'harvard', 'harvard university', 'harvard business school', 'hbs',
  'stanford', 'stanford university', 'stanford gsb',
  'mit', 'massachusetts institute of technology',
  'oxford', 'university of oxford', 'oxford university',
  'cambridge', 'university of cambridge',
  'wharton', 'wharton school', 'upenn', 'university of pennsylvania',
  'yale', 'yale university', 'princeton', 'princeton university',
  'columbia', 'columbia university', 'columbia business school',
  'chicago', 'university of chicago', 'booth school',
  'nyu', 'new york university', 'stern school',
  'berkeley', 'uc berkeley', 'haas school',
  'ucla', 'usc', 'caltech', 'georgia tech', 'cmu',
  'carnegie mellon', 'carnegie mellon university',
  'cornell', 'cornell university', 'johnson school',
  'duke', 'duke university', 'fuqua school',
  'northwestern', 'northwestern university', 'kellogg school',
  'dartmouth', 'tuck school', 'michigan', 'ross school',
  'virginia', 'darden school', 'unc', 'kenan-flagler',
  'brown', 'rice', 'vanderbilt', 'emory', 'georgetown',
  'ntu', 'nanyang technological', 'nus',
  'national university of singapore',
  'hkust', 'hong kong university',
  'imperial college', 'ucl', 'lse',
  'london school of economics', 'kings college',
  'edinburgh', 'manchester', 'warwick', 'bristol',
  'nottingham', 'birmingham', 'leeds', 'sheffield',
  'eth zurich', 'epfl', 'tu munich', 'rwth aachen',
  'university of toronto', 'mcgill', 'ubc',
  'university of british columbia',
  'university of melbourne', 'university of sydney',
  'unsw', 'monash university', 'anu',
  'australian national university',
  'university of tokyo', 'kyoto university',
  'tsinghua', 'peking university', 'fudan',
  'university of waterloo', 'waterloo',
]);

const KNOWN_TITLES = new Set([
  // C-Suite
  'ceo', 'cto', 'cfo', 'coo', 'cmo', 'cpo', 'cio', 'chro', 'cso', 'cro',
  'chief executive officer', 'chief technology officer',
  'chief financial officer', 'chief operating officer',
  'chief marketing officer', 'chief product officer',
  'chief information officer', 'chief human resources officer',
  'chief strategy officer', 'chief revenue officer',
  'chief data officer', 'chief analytics officer',
  'chief design officer', 'chief digital officer',
  'chief growth officer', 'chief commercial officer',
  'chief compliance officer', 'chief legal officer',
  'chief people officer', 'chief experience officer',

  // VP Level
  'vice president', 'vp', 'svp', 'senior vice president',
  'evp', 'executive vice president', 'avp', 'assistant vice president',
  'vp of engineering', 'vp of product', 'vp of sales',
  'vp of marketing', 'vp of operations', 'vp of finance',
  'vp of hr', 'vp of technology', 'vp of business development',
  'vp engineering', 'vp product', 'vp sales', 'vp marketing',
  'vp operations', 'vp finance', 'vp technology',

  // Director Level
  'director', 'associate director', 'senior director',
  'managing director', 'group director', 'executive director',
  'director of engineering', 'director of product',
  'director of operations', 'director of marketing',
  'director of sales', 'director of finance',
  'director of hr', 'director of strategy',
  'director of technology', 'director of design',
  'director of data', 'director of analytics',
  'engineering director', 'product director',
  'creative director', 'art director', 'design director',
  'technical director', 'program director', 'project director',
  'regional director', 'country director', 'national director',

  // Head / Leader
  'head', 'head of engineering', 'head of product',
  'head of design', 'head of data', 'head of analytics',
  'head of marketing', 'head of sales', 'head of operations',
  'head of finance', 'head of hr', 'head of strategy',
  'head of growth', 'head of partnerships',
  'head of business development', 'head of content',
  'head of research', 'head of qa', 'head of devops',
  'head of infrastructure', 'head of security',
  'head of mobile', 'head of frontend', 'head of backend',
  'practice head', 'delivery head', 'unit head',
  'vertical head', 'cluster head', 'zonal head',
  'department head',

  // General Manager / Manager Level
  'general manager', 'gm', 'agm', 'assistant general manager',
  'dgm', 'deputy general manager', 'senior general manager',
  'manager', 'senior manager', 'associate manager',
  'assistant manager', 'deputy manager', 'junior manager',
  'project manager', 'program manager', 'product manager',
  'engineering manager', 'delivery manager', 'operations manager',
  'business manager', 'account manager', 'relationship manager',
  'key account manager', 'territory manager', 'regional manager',
  'area manager', 'branch manager', 'store manager',
  'marketing manager', 'sales manager', 'finance manager',
  'hr manager', 'people manager', 'talent manager',
  'brand manager', 'category manager', 'channel manager',
  'content manager', 'community manager', 'social media manager',
  'campaign manager', 'growth manager', 'performance manager',
  'technical program manager', 'tpm', 'group product manager',
  'senior product manager', 'associate product manager',
  'senior project manager', 'senior engineering manager',
  'senior program manager', 'staff product manager',
  'principal product manager', 'senior technical program manager',

  // Lead / Principal / Staff
  'lead', 'tech lead', 'team lead', 'module lead',
  'technical lead', 'engineering lead', 'design lead',
  'frontend lead', 'backend lead', 'qa lead', 'test lead',
  'devops lead', 'data lead', 'analytics lead', 'ml lead',
  'ai lead', 'mobile lead', 'ios lead', 'android lead',
  'principal', 'principal engineer', 'principal architect',
  'principal consultant', 'principal designer',
  'principal data scientist', 'principal analyst',
  'principal software engineer',
  'staff', 'staff engineer', 'staff software engineer',
  'staff designer', 'staff data scientist',
  'senior staff engineer', 'senior staff software engineer',
  'distinguished engineer', 'fellow',

  // Architect
  'architect', 'solution architect', 'solutions architect',
  'enterprise architect', 'technical architect',
  'software architect', 'system architect', 'systems architect',
  'cloud architect', 'data architect', 'security architect',
  'infrastructure architect', 'network architect',
  'application architect', 'integration architect',
  'senior architect', 'principal architect', 'chief architect',

  // Engineer / Developer
  'engineer', 'software engineer', 'software developer',
  'senior software engineer', 'senior software developer',
  'senior engineer', 'junior engineer', 'junior developer',
  'associate software engineer', 'associate developer',
  'full stack developer', 'full stack engineer',
  'fullstack developer', 'fullstack engineer',
  'frontend developer', 'frontend engineer',
  'front end developer', 'front end engineer',
  'backend developer', 'backend engineer',
  'back end developer', 'back end engineer',
  'web developer', 'web engineer',
  'mobile developer', 'mobile engineer',
  'ios developer', 'ios engineer',
  'android developer', 'android engineer',
  'react developer', 'react native developer',
  'angular developer', 'vue developer', 'node developer',
  'python developer', 'java developer', 'go developer',
  'rust developer', 'ruby developer', 'php developer',
  'dotnet developer', '.net developer', 'c# developer',
  'devops engineer', 'sre', 'site reliability engineer',
  'platform engineer', 'infrastructure engineer',
  'cloud engineer', 'systems engineer', 'system engineer',
  'network engineer', 'security engineer',
  'qa engineer', 'test engineer', 'sdet',
  'software development engineer', 'sde', 'sde 1', 'sde 2', 'sde 3',
  'sde i', 'sde ii', 'sde iii',
  'software development engineer in test',
  'embedded engineer', 'firmware engineer', 'hardware engineer',
  'data engineer', 'ml engineer', 'machine learning engineer',
  'ai engineer', 'deep learning engineer', 'nlp engineer',
  'computer vision engineer', 'robotics engineer',
  'blockchain engineer', 'smart contract developer',
  'automation engineer', 'build engineer', 'release engineer',
  'support engineer', 'customer engineer', 'solutions engineer',
  'field engineer', 'implementation engineer',
  'performance engineer', 'reliability engineer',
  'production engineer', 'database engineer',

  // Analyst / Scientist / Researcher
  'analyst', 'senior analyst', 'junior analyst',
  'business analyst', 'data analyst', 'financial analyst',
  'research analyst', 'market analyst', 'marketing analyst',
  'operations analyst', 'systems analyst', 'security analyst',
  'credit analyst', 'risk analyst', 'investment analyst',
  'equity analyst', 'quantitative analyst', 'quant',
  'strategy analyst', 'pricing analyst', 'supply chain analyst',
  'bi analyst', 'intelligence analyst', 'product analyst',
  'growth analyst', 'ux researcher',
  'data scientist', 'senior data scientist',
  'research scientist', 'applied scientist',
  'ml scientist', 'research engineer',
  'scientist', 'researcher', 'postdoctoral researcher',
  'postdoc', 'research fellow', 'visiting researcher',
  'research associate', 'senior researcher',

  // Consultant
  'consultant', 'senior consultant', 'associate consultant',
  'principal consultant', 'management consultant',
  'strategy consultant', 'technology consultant',
  'business consultant', 'it consultant',
  'functional consultant', 'technical consultant',
  'sap consultant', 'oracle consultant', 'erp consultant',
  'salesforce consultant', 'implementation consultant',
  'advisory consultant', 'risk consultant',

  // Designer / Creative
  'designer', 'senior designer', 'ui designer', 'ux designer',
  'ui/ux designer', 'product designer', 'visual designer',
  'graphic designer', 'interaction designer',
  'motion designer', 'brand designer', 'web designer',
  'experience designer', 'service designer',
  'design researcher', 'content designer',

  // Executive / Specialist / Other
  'executive', 'senior executive', 'associate',
  'specialist', 'senior specialist',
  'coordinator', 'senior coordinator',
  'officer', 'chief of staff',
  'president', 'partner', 'senior partner', 'managing partner',
  'co-founder', 'co founder', 'cofounder',
  'founder', 'founder & ceo', 'founder and ceo',
  'entrepreneur in residence', 'eir',
  'advisor', 'senior advisor', 'strategic advisor',
  'board member', 'board of directors',
  'chairman', 'chairperson', 'vice chairman',
  'secretary', 'treasurer',

  // Intern / Trainee / Entry
  'intern', 'summer intern', 'winter intern',
  'software intern', 'engineering intern',
  'product intern', 'design intern', 'data intern',
  'marketing intern', 'finance intern', 'hr intern',
  'management trainee', 'graduate trainee',
  'trainee', 'apprentice', 'cadet',
  'fresher', 'graduate engineer trainee', 'get',

  // Academic
  'professor', 'associate professor', 'assistant professor',
  'adjunct professor', 'visiting professor',
  'lecturer', 'senior lecturer', 'reader',
  'teaching assistant', 'ta', 'research assistant', 'ra',
  'lab assistant', 'tutor', 'instructor',
  'dean', 'associate dean', 'registrar',
  'provost', 'chancellor', 'vice chancellor',

  // Domain-specific
  'scrum master', 'agile coach', 'delivery lead',
  'release manager', 'change manager',
  'customer success manager', 'csm',
  'account executive', 'ae', 'business development',
  'bdr', 'business development representative',
  'sdr', 'sales development representative',
  'inside sales', 'outside sales',
  'pre-sales', 'presales', 'presales consultant',
  'solution consultant', 'solutions consultant',
  'engagement manager', 'client partner',
  'technical writer', 'content writer', 'copywriter',
  'editor', 'editorial lead', 'content lead',
  'content strategist', 'seo specialist', 'seo analyst',
  'digital marketing', 'performance marketing',
  'growth hacker', 'growth lead',
  'supply chain manager', 'procurement manager',
  'logistics manager', 'warehouse manager',
  'quality manager', 'quality analyst', 'quality engineer',
  'compliance officer', 'legal counsel', 'company secretary',
  'chartered accountant', 'ca', 'cma', 'cs',
  'investment banker', 'portfolio manager',
  'wealth manager', 'private banker',
  'underwriter', 'actuary', 'claims manager',
  'medical officer', 'surgeon', 'physician',
  'pharmacist', 'clinical research associate',
]);

// ===== Helper patterns =====
const MONTHS = 'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?';
const DATE_RANGE_REGEX = new RegExp(
  `((?:${MONTHS})\\s*[''']?\\d{2,4}|\\d{4})\\s*[–—\\-~to]+\\s*((?:${MONTHS})\\s*[''']?\\d{2,4}|\\d{4}|present|current|till\\s*date|ongoing|now)`,
  'i'
);
const SINGLE_YEAR_REGEX = /\b(19|20)\d{2}\b/;
const DATE_LINE_REGEX = new RegExp(`(${MONTHS})[\\s.]*[''']?(\\d{2,4})`, 'i');
const PERCENTAGE_REGEX = /(\d{1,3}(?:\.\d+)?)\s*(?:%|percent|marks)/i;
const GPA_REGEX = /(?:(\d+(?:\.\d+)?)\s*\/\s*(\d+)\s*(?:cgpa|sgpa|gpa|cpi))|(?:(?:cgpa|sgpa|gpa|cpi)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:\/\s*(\d+))?)/i;
// Competitive exam / achievement patterns (NOT degrees)
const ACHIEVEMENT_PATTERNS = /\b(CAT|GMAT|GRE|GATE|CLAT|NEET|JEE|WBJEE|AIEEE|XAT|SNAP|NMAT|CMAT|MAT|IIFT|IPMAT|CFA|FRM|CPA|CMA|ACCA|CA\s*(?:Inter|Final|Foundation)?|CS\s*(?:Inter|Final|Foundation)?|ICWA|CMA|FLIP|Olympiad)\b/i;
const RANK_REGEX = /(?:rank|percentile|topper|gold\s*medal|silver\s*medal|distinction|first\s*class|second\s*class|honours|honors|merit|dean'?s?\s*list|valedictorian|summa\s*cum\s*laude|magna\s*cum\s*laude|cum\s*laude)/i;

// Known degree patterns — handles B.E., B.E, BE, B. E., etc.
const DEGREE_PATTERNS = /(?:^|\b|\s)(B\.?\s*\.?\s*E\.?|M\.?\s*\.?\s*E\.?|B\.?\s*\.?\s*Tech\.?|M\.?\s*\.?\s*Tech\.?|B\.?\s*\.?\s*Sc\.?|M\.?\s*\.?\s*Sc\.?|B\.?\s*\.?\s*A\.?|M\.?\s*\.?\s*A\.?|B\.?\s*\.?\s*Com\.?|M\.?\s*\.?\s*Com\.?|B\.?\s*\.?\s*Arch\.?|M\.?\s*\.?\s*Arch\.?|B\.?\s*\.?\s*Des\.?|M\.?\s*\.?\s*Des\.?|B\.?\s*\.?\s*Eng\.?|M\.?\s*\.?\s*Eng\.?|B\.?\s*\.?\s*Pharm\.?|M\.?\s*\.?\s*Pharm\.?|B\.?\s*\.?\s*Ed\.?|M\.?\s*\.?\s*Ed\.?|BBA|MBA|BCA|MCA|Ph\.?\s*D\.?|LLB|LLM|MBBS|MD|MS|BMS|BFA|MFA|Diploma|Higher\s*Secondary|Secondary|HSC|SSC|ICSE|ISC|CBSE|PGDM|PGDBM|PGP|Class\s*[-–—]?\s*(?:X{1,3}I{0,2}|IV|V?I{0,3}|10|12|11|9)|(?:10|12|11|9)(?:th|st|nd|rd)\s*(?:grade|class|standard|std)?|Bachelor(?:\s*(?:of|in)\s*\w+)?|Master(?:\s*(?:of|in)\s*\w+)?|Doctor(?:ate)?(?:\s*(?:of|in)\s*\w+)?|Post\s*[-]?\s*Graduate|Under\s*[-]?\s*Graduate|Intermediate|Engineering|(?:B|M)\.?\s*(?:Phil|Litt)|Associate(?:\s*Degree)?)/i;

// Company indicators (regex fallback)
const COMPANY_INDICATORS = /\b(technologies|technology|tech|pvt|ltd|limited|private|inc|corp|corporation|llc|llp|solutions|services|consulting|consultancy|group|enterprises|systems|software|labs|ventures|capital|partners|industries|global|india|analytics|digital|networks)\b/i;

// Institution indicators (regex fallback)
const INSTITUTION_INDICATORS = /\b(university|univeristy|univ\.?|institute|institution|college|school|academy|polytechnic|board|council|vidyalaya|vidyapeeth|vishwavidyalaya|mahavidyalaya|kendriya|navodaya|sainik)\b/i;

// Job title regex fallback
const JOB_TITLE_REGEX_FALLBACK = /\b(engineer|developer|manager|director|vp|vice\s*president|head|lead|senior|junior|analyst|consultant|architect|designer|associate|executive|officer|specialist|coordinator|intern|trainee|founder|co-founder|ceo|cto|cfo|coo|cmo|cpo|chief|president|partner|principal|product\s*manager|program\s*manager|project\s*manager|business\s*analyst|data\s*scientist|data\s*analyst|data\s*engineer|software\s*engineer|full\s*stack|frontend|backend|devops|sre|qa|tester|testing|scrum\s*master|agile\s*coach|strategy|operations|marketing|sales|finance|hr|human\s*resources|growth|content|editorial|research|professor|lecturer|teaching\s*assistant|fellow|staff\s*engineer|distinguished\s*engineer|member\s*of\s*technical\s*staff)\b/i;


// ===== Set-based matching functions =====

/**
 * Check if text contains a known company name (case-insensitive).
 * Returns the matched company name or null.
 */
function matchKnownCompany(text) {
  if (!text) return null;
  const lower = text.toLowerCase().trim();

  // Direct full match against built-in + learned
  if (KNOWN_COMPANIES.has(lower)) return text.trim();
  const learnedCompanies = learningStore.getLearnedCompanies();
  if (learnedCompanies.has(lower)) return text.trim();

  // Try substring matching - find the longest match
  let bestMatch = null;
  let bestLen = 0;
  const allCompanies = [...KNOWN_COMPANIES, ...learnedCompanies];
  for (const company of allCompanies) {
    if (company.length > 3 && lower.includes(company) && company.length > bestLen) {
      bestMatch = company;
      bestLen = company.length;
    }
  }
  if (bestMatch) return bestMatch;

  return null;
}

/**
 * Check if text contains a known institution name (case-insensitive).
 * Returns the matched institution name or null.
 */
function matchKnownInstitution(text) {
  if (!text) return null;
  const lower = text.toLowerCase().trim();

  if (KNOWN_INSTITUTIONS.has(lower)) return text.trim();
  const learnedInstitutions = learningStore.getLearnedInstitutions();
  if (learnedInstitutions.has(lower)) return text.trim();

  let bestMatch = null;
  let bestLen = 0;
  const allInstitutions = [...KNOWN_INSTITUTIONS, ...learnedInstitutions];
  for (const inst of allInstitutions) {
    if (inst.length > 2 && lower.includes(inst) && inst.length > bestLen) {
      bestMatch = inst;
      bestLen = inst.length;
    }
  }
  if (bestMatch) return bestMatch;

  return null;
}

/**
 * Check if text contains a known job title (case-insensitive).
 * Returns the matched title or null.
 */
function matchKnownTitle(text) {
  if (!text) return null;
  const lower = text.toLowerCase().trim();

  if (KNOWN_TITLES.has(lower)) return text.trim();
  const learnedTitles = learningStore.getLearnedTitles();
  if (learnedTitles.has(lower)) return text.trim();

  // Try substring matching for multi-word titles (longest match first)
  let bestMatch = null;
  let bestLen = 0;
  const allTitles = [...KNOWN_TITLES, ...learnedTitles];
  for (const title of allTitles) {
    if (title.length > 4 && lower.includes(title) && title.length > bestLen) {
      bestMatch = title;
      bestLen = title.length;
    }
  }
  if (bestMatch) return bestMatch;

  return null;
}

/**
 * Returns true if text looks like a company (known set or regex fallback)
 */
function isCompanyLike(text) {
  return !!matchKnownCompany(text) || COMPANY_INDICATORS.test(text);
}

/**
 * Returns true if text looks like a job title (known set or regex fallback)
 */
function isTitleLike(text) {
  return !!matchKnownTitle(text) || JOB_TITLE_REGEX_FALLBACK.test(text);
}

/**
 * Returns true if text looks like an institution (known set or regex fallback)
 */
function isInstitutionLike(text) {
  return !!matchKnownInstitution(text) || INSTITUTION_INDICATORS.test(text);
}


// ===== Text Normalization =====

/**
 * Detect if a line is "spaced out" like "P R O F E S S I O N A L"
 * Pattern: single chars separated by spaces, possibly with multi-space word gaps
 */
function isSpacedOut(line) {
  // Match: single letter, space, single letter, space... (at least 4 letters)
  // Allow multi-space gaps between "words" (e.g., "A N K A N   S E N G U P T A")
  const stripped = line.replace(/\s+/g, '');
  if (stripped.length < 3) return false;
  // Count single-char tokens separated by single spaces
  const tokens = line.split(/\s+/);
  const singleCharTokens = tokens.filter(t => t.length === 1 && /[A-Za-z]/.test(t));
  // If most tokens are single chars, it's spaced out
  return singleCharTokens.length >= 3 && singleCharTokens.length >= tokens.length * 0.6;
}

/**
 * Collapse spaced-out text: "P R O F E S S I O N A L   E X P E R I E N C E" → "PROFESSIONAL EXPERIENCE"
 */
function collapseSpacedText(line) {
  // Split into "word groups" separated by 2+ spaces (word boundaries in spaced text)
  const groups = line.split(/\s{2,}/);
  return groups.map(g => {
    // Check if this group is spaced-out letters
    const tokens = g.split(/\s+/);
    if (tokens.length >= 2 && tokens.every(t => t.length === 1)) {
      return tokens.join('');
    }
    return g;
  }).join(' ');
}

/**
 * Normalize raw text from PDF/DOCX extraction.
 * Fixes:
 * 1. Spaced-out headers and names
 * 2. Concatenated company+date (e.g., "JUSPAY TechnologiesJan 2022 – Present")
 * 3. Bullet points concatenated without proper line breaks
 */
function normalizeText(text) {
  let lines = text.split('\n');
  const normalized = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line.length === 0) {
      normalized.push('');
      continue;
    }

    // 1. Collapse spaced-out text
    if (isSpacedOut(line)) {
      line = collapseSpacedText(line);
    }

    // 2. Split concatenated company+date lines
    // Pattern: "JUSPAY TechnologiesJan 2022 – Present" or "ZestMoneyApr 2019 – Dec 2021"
    // Also: "Yes Bank Ltd.May 2018 – Apr 2019"
    const concatMatch = line.match(/^(.+?)([A-Z][a-z]{2}\s+\d{4}\s*[–—\-]\s*(?:[A-Z][a-z]{2}\s+\d{4}|Present|Current|Till\s*Date|Ongoing).*)$/);
    if (concatMatch) {
      const before = concatMatch[1].trim();
      const datepart = concatMatch[2].trim();
      // Only split if the "before" part ends with a word character (no separator before date)
      if (before.length > 2 && /[a-zA-Z).]$/.test(before)) {
        line = before + '\t' + datepart;
      }
    }

    // 3. Split concatenated text+percentage/year (education lines)
    // Pattern: "Jadavpur University8/10 CGPA2015" or "FMS, University of Delhi72.81%2017"
    // Split percentage stuck to text
    line = line.replace(/([a-zA-Z)])(\d+(?:\.\d+)?%)/g, '$1\t$2');
    // Split "CGPA2015" -> "CGPA\t2015" (year stuck to end of text)
    line = line.replace(/(CGPA|GPA|CPI|SGPA|%)\s*(\d{4})\b/gi, '$1\t$2');
    // Split institution name stuck to fraction: "University8/10" -> "University\t8/10"
    line = line.replace(/([a-zA-Z)])(\d+\/\d+\s*(?:CGPA|GPA|CPI|SGPA)?)/gi, '$1\t$2');

    normalized.push(line);
  }

  return normalized.join('\n');
}


// ===== Main Section Extractor =====

function extractSections(text) {
  // Normalize text before processing
  text = normalizeText(text);

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const resume = {
    name: '', email: '', phone: '', location: '', linkedin: '', website: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    achievements: [],
    projects: [],
    languages: [],
    additionalSections: []
  };

  // === Extract contact info from first ~10 lines ===
  const emailRegex = /[\w.+-]+@[\w.-]+\.\w+/;
  const phoneRegex = /(\+?\d[\d\s\-().]{7,}\d)/;
  const linkedinRegex = /linkedin\.com\/in\/[\w-]+/i;

  // First non-contact line is likely the name
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (!emailRegex.test(firstLine) && !phoneRegex.test(firstLine) &&
        !linkedinRegex.test(firstLine) && firstLine.length < 60) {
      resume.name = firstLine;
    }
  }

  // Scan first 10 lines for contact info
  const headerText = lines.slice(0, 10).join(' ');
  const emailMatch = headerText.match(emailRegex);
  if (emailMatch) resume.email = emailMatch[0];

  const phoneMatch = headerText.match(phoneRegex);
  if (phoneMatch) resume.phone = phoneMatch[1].trim();

  const linkedinMatch = headerText.match(linkedinRegex);
  if (linkedinMatch) resume.linkedin = linkedinMatch[0];

  // Try to extract location from header
  const locationPatterns = [
    /\b(Mumbai|Delhi|Bangalore|Bengaluru|Hyderabad|Chennai|Kolkata|Pune|Ahmedabad|Jaipur|Lucknow|Noida|Gurgaon|Gurugram|Chandigarh|Indore|Bhopal|Patna|Kochi|Thiruvananthapuram|Coimbatore|Nagpur|Visakhapatnam|Surat|Vadodara|New\s*Delhi|NCR|Goa)(?:\s*,\s*(?:India|IN))?\b/i,
    /\b(New\s*York|San\s*Francisco|London|Singapore|Dubai|Toronto|Sydney|Berlin|Tokyo|Seattle|Austin|Boston|Chicago|Los\s*Angeles)\b/i
  ];
  for (const locRegex of locationPatterns) {
    const locMatch = headerText.match(locRegex);
    if (locMatch) {
      resume.location = locMatch[0];
      break;
    }
  }

  // === Section detection ===
  // Enhanced: handles ALL CAPS, underlines (---), colons, pipes, brackets, dashes
  // Strips leading/trailing decorators before matching
  function cleanSectionLine(line) {
    return line
      .replace(/^[-=_*#|►▶▪●•◆☛→\s]+/, '')  // Leading decorators
      .replace(/[-=_*#|►▶▪●•◆☛→\s:]+$/, '')  // Trailing decorators/colons
      .trim();
  }

  const sectionHeaders = {
    summary: /^(summary|profile|objective|about\s*me|professional\s*summary|career\s*summary|executive\s*summary|career\s*objective|personal\s*statement|professional\s*profile)$/i,
    experience: /^(experience|work\s*experience|employment|professional\s*experience|work\s*history|career\s*history|employment\s*history|internship|internships|relevant\s*experience|industry\s*experience)$/i,
    education: /^(education|academic|qualifications?|educational\s*(?:background|qualifications?)|academic\s*(?:background|qualifications?|details?|credentials?)|scholastics?)$/i,
    skills: /^(skills|technical\s*skills|core\s*competencies|competencies|key\s*skills|technologies|tools|areas?\s*of\s*expertise|skill\s*set|functional\s*skills|professional\s*skills|domain\s*expertise|technical\s*expertise|technical\s*proficiency)$/i,
    certifications: /^(certifications?(?:\s*(?:&|and)\s*(?:achievements?|awards?|licenses?|training))?|licenses?|credentials|professional\s*certifications?|courses?\s*(?:&|and)\s*certifications?|training\s*(?:&|and)\s*certifications?|achievements?(?:\s*(?:&|and)\s*certifications?)?|awards?\s*(?:&|and)\s*(?:certifications?|achievements?)|honors?\s*(?:&|and)\s*awards?|accomplishments?|distinctions?)$/i,
    projects: /^(projects|personal\s*projects|key\s*projects|notable\s*projects|academic\s*projects|side\s*projects|research\s*projects|selected\s*projects)$/i,
    languages: /^(languages|language\s*proficiency|language\s*skills|languages?\s*known)$/i
  };

  let currentSection = 'header';
  let sectionLines = { header: [], summary: [], experience: [], education: [], skills: [], certifications: [], projects: [], languages: [] };
  let internshipLines = [];

  // First pass: identify sections and collect lines
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    let sectionFound = false;

    // Clean the line (strip decorators) before matching headers
    const cleaned = cleanSectionLine(line);
    if (cleaned.length > 0 && cleaned.length < 60) {
      for (const [section, regex] of Object.entries(sectionHeaders)) {
        if (regex.test(cleaned)) {
          currentSection = section;
          sectionFound = true;
          break;
        }
      }
    }

    // Also check for underline-style headers: a short text line followed by "---" or "==="
    if (!sectionFound && i + 1 < lines.length && /^[-=_]{3,}$/.test(lines[i + 1])) {
      const headerClean = cleanSectionLine(line);
      if (headerClean.length > 0 && headerClean.length < 50) {
        for (const [section, regex] of Object.entries(sectionHeaders)) {
          if (regex.test(headerClean)) {
            currentSection = section;
            sectionFound = true;
            break;
          }
        }
      }
    }

    if (!sectionFound) {
      // Skip underline-only lines (e.g., "----------")
      if (/^[-=_]{3,}$/.test(line)) continue;
      if (!sectionLines[currentSection]) sectionLines[currentSection] = [];
      sectionLines[currentSection].push(line);
    }
  }

  // === Process Summary ===
  resume.summary = sectionLines.summary.join(' ').trim();

  // === Process Experience ===
  resume.experience = parseExperience(sectionLines.experience);

  // === Process Education ===
  resume.education = parseEducation(sectionLines.education);

  // === Process Skills ===
  for (const line of sectionLines.skills) {
    const skillItems = line.split(/[,;|•·▪►★✓✔→\-]/)
      .map(s => s.replace(/^\s*[-•·]\s*/, '').trim())
      .filter(s => s.length > 0 && s.length < 80);
    resume.skills.push(...skillItems);
  }
  resume.skills = [...new Set(resume.skills)].filter(s => s.length > 1);

  // === Process Certifications & Achievements ===
  for (const line of sectionLines.certifications) {
    const cleaned = line.replace(/^[-•·▪►★✓✔→]\s*/, '').trim();
    if (cleaned.length === 0) continue;
    // Separate achievements (competitive exams, rankings, percentiles) from certifications
    if (ACHIEVEMENT_PATTERNS.test(cleaned) || RANK_REGEX.test(cleaned) || /percentile|rank\s*\d|top\s*\d/i.test(cleaned)) {
      resume.achievements.push(cleaned);
    } else {
      resume.certifications.push(cleaned);
    }
  }

  // === Process Projects ===
  resume.projects = parseProjects(sectionLines.projects);

  // === Process Languages ===
  for (const line of (sectionLines.languages || [])) {
    const langItems = line.split(/[,;|•·▪]/).map(s => s.trim()).filter(s => s.length > 0 && s.length < 40);
    resume.languages.push(...langItems);
  }
  resume.languages = [...new Set(resume.languages)];

  return resume;
}


// ===== Experience Parser =====
function parseExperience(lines) {
  if (!lines || lines.length === 0) return [];

  // PHASE 1: Pre-process lines — expand TAB-separated lines into logical parts
  // Many resumes use: "Company Name\tDate Range" or "Title\tCompany\tDate"
  const expandedLines = [];
  for (const line of lines) {
    if (line.includes('\t')) {
      const tabParts = line.split('\t').map(p => p.trim()).filter(p => p.length > 0);
      expandedLines.push({ raw: line, parts: tabParts, isTabbedLine: true });
    } else {
      expandedLines.push({ raw: line, parts: [line], isTabbedLine: false });
    }
  }

  // PHASE 2: Identify "header" lines (lines that start a new job entry)
  // A header is: a line containing a date range, OR a line with a known company/title
  // that's followed by a line with more job info
  const entries = [];
  let current = null;
  let titleConsumedOnNextLine = false;

  for (let i = 0; i < expandedLines.length; i++) {
    const item = expandedLines[i];
    const line = item.raw;
    const parts = item.parts;

    // Skip if this line was consumed as a title line
    if (titleConsumedOnNextLine) {
      titleConsumedOnNextLine = false;
      continue;
    }

    // Check for date range in the full line
    const dateRangeMatch = line.match(DATE_RANGE_REGEX);

    if (dateRangeMatch) {
      // === NEW ENTRY: This line has a date range ===
      if (current) entries.push(current);
      current = { title: '', company: '', duration: dateRangeMatch[0], description: '' };

      if (item.isTabbedLine) {
        // TAB-separated: typically "Company\tDate" or "Title\tCompany\tDate"
        const nonDateParts = parts.filter(p => !DATE_RANGE_REGEX.test(p));
        if (nonDateParts.length === 1) {
          // Single non-date part — determine if it's company or title
          const part = nonDateParts[0];
          if (isCompanyLike(part)) {
            current.company = part;
          } else if (isTitleLike(part)) {
            current.title = part;
          } else {
            // Default: treat as company (most common format)
            current.company = part;
          }
        } else if (nonDateParts.length >= 2) {
          // Multiple parts: try to assign title and company
          for (const part of nonDateParts) {
            if (isCompanyLike(part) && !current.company) {
              current.company = part;
            } else if (isTitleLike(part) && !current.title) {
              current.title = part;
            } else if (!current.company) {
              current.company = part;
            } else if (!current.title) {
              current.title = part;
            }
          }
        }
      } else {
        // Non-tabbed line with date: extract text before/after date
        const dateIdx = line.indexOf(dateRangeMatch[0]);
        const before = line.substring(0, dateIdx).replace(/[|,–—\-\t]\s*$/, '').trim();
        const after = line.substring(dateIdx + dateRangeMatch[0].length).replace(/^[|,–—\-\t]\s*/, '').trim();
        const textPart = before || after;
        if (textPart) {
          parseJobTitleCompany(textPart, current);
        }
      }

      // Look at next line for title if we only have company (or vice versa)
      if (i + 1 < expandedLines.length) {
        const nextLine = expandedLines[i + 1].raw;
        const nextHasDate = DATE_RANGE_REGEX.test(nextLine);
        if (!nextHasDate && nextLine.length < 150) {
          if (current.company && !current.title && isTitleLike(nextLine)) {
            // Next line has the title — extract just the title part (before any – separator for role details)
            const titleParts = nextLine.split(/\s*[–—]\s*/);
            current.title = titleParts[0].trim();
            // If there are parts after –, they're role context (keep as part of title)
            if (titleParts.length > 1) {
              current.title = nextLine; // Keep the full title with context
            }
            titleConsumedOnNextLine = true;
          } else if (current.title && !current.company && isCompanyLike(nextLine)) {
            current.company = nextLine.replace(/[|,–—\-]\s*$/, '').trim();
            titleConsumedOnNextLine = true;
          } else if (!current.title && !current.company) {
            parseJobTitleCompany(nextLine, current);
            if (current.title || current.company) {
              titleConsumedOnNextLine = true;
            }
          }
        }
      }
    } else {
      // === No date range on this line ===
      // Could be: a title line (already consumed), a description bullet, or a standalone header
      const isBullet = /^[-•▪►★✓✔→●◆■]/.test(line);

      if (!current) {
        // No current entry — this might be a company or title that starts an entry
        // (date might come on next line)
        if (i + 1 < expandedLines.length && DATE_RANGE_REGEX.test(expandedLines[i + 1].raw)) {
          // Next line has date — this line is part of the header, will be processed then
          continue;
        }
        // Start a tentative entry
        if (line.length < 120 && (isTitleLike(line) || isCompanyLike(line))) {
          current = { title: '', company: '', duration: '', description: '' };
          parseJobTitleCompany(line, current);
        }
      } else {
        // We have a current entry — this is a description line
        const cleanLine = line.replace(/^[-•▪►★✓✔→●◆■]\s*/, '').trim();
        if (cleanLine) {
          current.description += (current.description ? '\n' : '') + cleanLine;
        }
      }
    }
  }

  if (current) entries.push(current);

  // Post-process
  for (const entry of entries) {
    if (!entry.title && entry.company) {
      if (isTitleLike(entry.company) && !isCompanyLike(entry.company)) {
        entry.title = entry.company;
        entry.company = '';
      }
    }
    if (!entry.company && entry.title) {
      if (isCompanyLike(entry.title) && !isTitleLike(entry.title)) {
        entry.company = entry.title;
        entry.title = '';
      }
    }
    entry.title = (entry.title || '').replace(/[|,–—\-]\s*$/, '').replace(/^\s*[|,–—\-]\s*/, '').trim();
    entry.company = (entry.company || '').replace(/^[|,–—\-]\s*/, '').replace(/[|,–—\-]\s*$/, '').trim();
    entry.duration = (entry.duration || '').trim();
  }

  // Remove empty entries
  return entries.filter(e => e.title || e.company || e.description);
}

function parseJobTitleCompany(text, entry) {
  if (!text) return;

  // Remove trailing/leading separators
  text = text.replace(/^[|,–—\-]\s*/, '').replace(/[|,–—\-]\s*$/, '').trim();

  console.log(`  [parseJobTitleCompany] input: "${text}"`);

  // First: check for known entities in the full text
  const knownCompanyInText = matchKnownCompany(text);
  const knownTitleInText = matchKnownTitle(text);

  // If we find BOTH a known company and known title in the same text, split them
  if (knownCompanyInText && knownTitleInText) {
    // Find the positions to split
    const companyLower = knownCompanyInText.toLowerCase();
    const titleLower = knownTitleInText.toLowerCase();
    const textLower = text.toLowerCase();

    const companyIdx = textLower.indexOf(companyLower);
    const titleIdx = textLower.indexOf(titleLower);

    if (companyIdx >= 0 && titleIdx >= 0) {
      // Extract the actual substrings from original text preserving case
      if (titleIdx < companyIdx) {
        entry.title = text.substring(titleIdx, titleIdx + titleLower.length).trim();
        entry.company = text.substring(companyIdx, companyIdx + companyLower.length).trim();
        // But try to get more context - grab the full segments
        entry.title = extractSegmentAround(text, titleIdx, titleIdx + titleLower.length);
        entry.company = extractSegmentAround(text, companyIdx, companyIdx + companyLower.length);
      } else {
        entry.company = text.substring(companyIdx, companyIdx + companyLower.length).trim();
        entry.title = text.substring(titleIdx, titleIdx + titleLower.length).trim();
        entry.company = extractSegmentAround(text, companyIdx, companyIdx + companyLower.length);
        entry.title = extractSegmentAround(text, titleIdx, titleIdx + titleLower.length);
      }
      console.log(`  [parseJobTitleCompany] known match -> title="${entry.title}" company="${entry.company}"`);
      return;
    }
  }

  // Try splitting by common separators: |, "at", "–", ","
  const separators = [
    /\s*\|\s*/,
    /\s+at\s+/i,
    /\s*[–—]\s*/,
    /\s*,\s+/
  ];

  for (const sep of separators) {
    const parts = text.split(sep).map(p => p.trim()).filter(p => p.length > 0);
    if (parts.length >= 2) {
      const firstIsTitle = isTitleLike(parts[0]);
      const secondIsTitle = isTitleLike(parts[1]);
      const firstIsCompany = isCompanyLike(parts[0]);
      const secondIsCompany = isCompanyLike(parts[1]);

      console.log(`  [parseJobTitleCompany] split: ["${parts[0]}", "${parts[1]}"] firstTitle=${firstIsTitle} firstCompany=${firstIsCompany} secondTitle=${secondIsTitle} secondCompany=${secondIsCompany}`);

      if (firstIsTitle && secondIsCompany) {
        entry.title = parts[0];
        entry.company = parts[1];
        return;
      } else if (firstIsCompany && secondIsTitle) {
        entry.company = parts[0];
        entry.title = parts[1];
        return;
      } else if (firstIsTitle && !secondIsTitle) {
        entry.title = parts[0];
        entry.company = parts[1];
        return;
      } else if (secondIsTitle && !firstIsTitle) {
        entry.title = parts[1];
        entry.company = parts[0];
        return;
      } else if (firstIsCompany) {
        entry.company = parts[0];
        entry.title = parts.slice(1).join(' ');
        return;
      } else if (secondIsCompany) {
        entry.title = parts[0];
        entry.company = parts[1];
        return;
      } else {
        // Default: first part is title, second is company
        entry.title = parts[0];
        entry.company = parts[1];
        return;
      }
    }
  }

  // No separator found — use known-entity matching or regex fallback
  if (knownTitleInText && !knownCompanyInText) {
    entry.title = text;
  } else if (knownCompanyInText && !knownTitleInText) {
    entry.company = text;
  } else if (isTitleLike(text) && !isCompanyLike(text)) {
    entry.title = text;
  } else if (isCompanyLike(text) && !isTitleLike(text)) {
    entry.company = text;
  } else {
    // Default: assign to whichever field is empty
    if (!entry.title) entry.title = text;
    else if (!entry.company) entry.company = text;
  }

  console.log(`  [parseJobTitleCompany] result -> title="${entry.title}" company="${entry.company}"`);
}

/**
 * Given a text and a range [start, end) of a known match,
 * extract the full segment around it (bounded by separators).
 */
function extractSegmentAround(text, start, end) {
  // Find the separator boundaries around the match
  const seps = /[|,–—]/;
  let segStart = start;
  let segEnd = end;

  // Walk backwards to find separator or start of string
  while (segStart > 0 && !seps.test(text[segStart - 1])) {
    segStart--;
  }
  // Walk forwards to find separator or end of string
  while (segEnd < text.length && !seps.test(text[segEnd])) {
    segEnd++;
  }

  return text.substring(segStart, segEnd).trim();
}


// ===== Education Parser =====
// Enhanced GPA regex that handles "8/10 CGPA" format
const GPA_SLASH_REGEX = /(\d+(?:\.\d+)?)\s*\/\s*(\d+)\s*(?:cgpa|sgpa|gpa|cpi)?/i;
const GPA_LABEL_REGEX = /(?:cgpa|sgpa|gpa|cpi)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:\/\s*(\d+))?/i;
const PERCENTAGE_LINE_REGEX = /(\d{1,3}(?:\.\d+)?)\s*%/;

function parseEducation(lines) {
  if (!lines || lines.length === 0) return [];

  const entries = [];
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const isBullet = /^[-•▪►★✓✔→●◆■]/.test(rawLine);

    // First expand TAB-separated parts into a single logical line
    const line = rawLine.replace(/\t+/g, ' | ');

    // Skip lines that are actually section headers that leaked in
    if (/^(certifications?|achievements?|internship|awards?)/i.test(line.trim())) continue;

    // Check if this line is an achievement, NOT a degree (CFA, CAT, WBJEE, etc.)
    if (ACHIEVEMENT_PATTERNS.test(line) && !DEGREE_PATTERNS.test(line.replace(ACHIEVEMENT_PATTERNS, ''))) {
      // This is an achievement line — skip it for education, it's handled in certifications
      if (current) {
        // But add to current entry's details if it's related (e.g., "Top 15% at FMS")
      }
      continue;
    }

    const hasDegree = DEGREE_PATTERNS.test(line);
    const hasInstitution = isInstitutionLike(line);
    const hasYear = SINGLE_YEAR_REGEX.test(line);

    // Is this a new education entry?
    const isNewEntry = hasDegree || (hasInstitution && !isBullet && (!current || current.institution));

    if (isNewEntry && !isBullet) {
      if (current) entries.push(current);
      current = { degree: '', institution: '', year: '', details: '' };
      parseEducationLine(line, current);
      continue;
    }

    if (current) {
      if (!isBullet && hasInstitution && !current.institution) {
        const cleaned = line.replace(DATE_RANGE_REGEX, '').replace(SINGLE_YEAR_REGEX, '').trim().replace(/[|,–—\-]\s*$/, '').trim();
        current.institution = cleaned || line;
        extractYear(line, current);
      } else if (hasGPAorPercentage(line) || RANK_REGEX.test(line) || isBullet) {
        const cleaned = line.replace(/^[-•▪►★✓✔→●◆■]\s*/, '').trim();
        addEducationDetails(cleaned, current);
      } else if (!current.institution && line.length < 120 && !isBullet) {
        current.institution = line.replace(/[|,–—\-]\s*$/, '').trim();
        extractYear(line, current);
      } else {
        const cleaned = line.replace(/^[-•▪►★✓✔→●◆■]\s*/, '').trim();
        if (cleaned) addEducationDetails(cleaned, current);
      }
    } else {
      current = { degree: '', institution: '', year: '', details: '' };
      parseEducationLine(line, current);
    }
  }

  if (current) entries.push(current);

  // Post-process
  for (const entry of entries) {
    if (entry.degree && !entry.year) extractYear(entry.degree, entry);
    if (entry.year && entry.degree) {
      entry.degree = entry.degree.replace(new RegExp(`\\b${entry.year}\\b`), '').replace(/[|,–—\-]\s*$/, '').replace(/^\s*[|,–—\-]/, '').trim();
    }
    // Move any GPA/percentage from degree or institution to details
    moveGPAtoDetails(entry, 'degree');
    moveGPAtoDetails(entry, 'institution');
    // Clean tabs from institution
    entry.institution = (entry.institution || '').replace(/\t/g, ' ').trim();
    entry.degree = (entry.degree || '').trim();
    entry.details = (entry.details || '').trim();
  }

  return entries.filter(e => e.degree || e.institution);
}

function hasGPAorPercentage(text) {
  return PERCENTAGE_REGEX.test(text) || GPA_SLASH_REGEX.test(text) || GPA_LABEL_REGEX.test(text) || PERCENTAGE_LINE_REGEX.test(text);
}

function moveGPAtoDetails(entry, field) {
  if (!entry[field]) return;
  const matchers = [GPA_SLASH_REGEX, GPA_LABEL_REGEX, PERCENTAGE_REGEX, PERCENTAGE_LINE_REGEX];
  for (const regex of matchers) {
    const match = entry[field].match(regex);
    if (match) {
      const pctStr = match[0];
      entry[field] = entry[field].replace(pctStr, '').replace(/[|,–—\-]\s*$/, '').replace(/^\s*[|,–—\-]/, '').trim();
      if (!entry.details.includes(pctStr)) {
        entry.details = (entry.details ? entry.details + '\n' : '') + pctStr;
      }
    }
  }
}

function parseEducationLine(line, entry) {
  // Extract year first
  extractYear(line, entry);

  // Remove year from line
  let cleaned = line;
  if (entry.year) {
    cleaned = cleaned.replace(new RegExp(`\\b${entry.year}\\b`), '').trim();
  }
  cleaned = cleaned.replace(DATE_RANGE_REGEX, '').trim();

  // Extract GPA/percentage → details (handles "8/10 CGPA", "72.81%", "CGPA 8.5/10")
  const gpaMatchers = [GPA_SLASH_REGEX, GPA_LABEL_REGEX, PERCENTAGE_REGEX, PERCENTAGE_LINE_REGEX];
  for (const regex of gpaMatchers) {
    let match = cleaned.match(regex);
    while (match) {
      const pctStr = match[0];
      cleaned = cleaned.replace(pctStr, '').trim();
      entry.details = (entry.details ? entry.details + '\n' : '') + pctStr;
      match = cleaned.match(regex);
    }
  }

  // Clean separators
  cleaned = cleaned.replace(/^[|,–—\-]\s*/, '').replace(/[|,–—\-]\s*$/, '').trim();

  // Split by | or TAB or –
  const separators = [/\s*\|\s*/, /\s*\t+\s*/, /\s*[–—]\s*/, /\s*,\s+/];
  let parts = [cleaned];
  for (const sep of separators) {
    const split = cleaned.split(sep).map(p => p.trim()).filter(p => p.length > 0);
    if (split.length >= 2) {
      parts = split;
      break;
    }
  }

  // Assign parts to degree vs institution
  for (const part of parts) {
    if (!part || part.length < 2) continue;
    const hasDeg = DEGREE_PATTERNS.test(part);
    const hasInst = isInstitutionLike(part);
    const hasPct = hasGPAorPercentage(part);

    if (hasPct) {
      addEducationDetails(part, entry);
    } else if (hasDeg && !entry.degree) {
      entry.degree = part;
    } else if (hasInst && !entry.institution) {
      entry.institution = part;
    } else if (!entry.degree) {
      entry.degree = part;
    } else if (!entry.institution) {
      entry.institution = part;
    } else {
      addEducationDetails(part, entry);
    }
  }
}

function extractYear(text, entry) {
  if (entry.year) return;
  // Prefer date ranges first
  const rangeMatch = text.match(DATE_RANGE_REGEX);
  if (rangeMatch) {
    // Extract the end year
    const endYear = rangeMatch[2].match(/\b(19|20)\d{2}\b/);
    if (endYear) {
      entry.year = endYear[0];
      return;
    }
  }
  // Single year
  const yearMatch = text.match(/\b((?:19|20)\d{2})\b/);
  if (yearMatch) {
    entry.year = yearMatch[1];
  }
}

function addEducationDetails(text, entry) {
  if (!text || text.length < 2) return;
  if (entry.details) {
    entry.details += '\n' + text;
  } else {
    entry.details = text;
  }
}


// ===== Projects Parser =====
function parseProjects(lines) {
  if (!lines || lines.length === 0) return [];

  const entries = [];
  let current = null;

  for (const line of lines) {
    const isBullet = /^[-•▪►★✓✔→●◆■]/.test(line);

    if (!isBullet && line.length < 100 && !current) {
      current = { name: line, description: '' };
    } else if (!isBullet && line.length < 80 && current && !current.description) {
      // Might be a subtitle or new project
      if (current.description || current.name) {
        entries.push(current);
      }
      current = { name: line, description: '' };
    } else if (current) {
      const cleanLine = line.replace(/^[-•▪►★✓✔→●◆■]\s*/, '').trim();
      if (cleanLine) {
        current.description += (current.description ? '\n' : '') + cleanLine;
      }
    } else {
      current = { name: line.replace(/^[-•▪►★✓✔→●◆■]\s*/, '').trim(), description: '' };
    }
  }

  if (current) entries.push(current);
  return entries;
}


module.exports = { parseResume };
