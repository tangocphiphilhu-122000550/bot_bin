// Country data for fake address generation (converted from country.js)

const rand = (max) => Math.floor(Math.random() * max);
const randDigits = (n) => Array.from({ length: n }, () => rand(10)).join("");
const randLetter = () => String.fromCharCode(65 + rand(26));

function generateZip(country, prefix) {
    const formats = {
        "United Kingdom": () => `${randLetter()}${randLetter()}${rand(10)}${rand(10)} ${rand(10)}${randLetter()}${randLetter()}`,
        "Canada": () => `${prefix}${rand(10)}${randLetter()} ${rand(10)}${randLetter()}${rand(10)}`,
        "Netherlands": () => `${randDigits(4)} ${randLetter()}${randLetter()}`,
        "Brazil": () => `${prefix}${randDigits(4)}-${randDigits(3)}`,
        "Japan": () => `${prefix}${randDigits(2)}-${randDigits(4)}`,
        "Ireland": () => `${randLetter()}${randDigits(2)} ${randLetter()}${randLetter()}${randDigits(2)}`,
        "Argentina": () => `${randLetter()}${randDigits(4)}${randLetter()}${randLetter()}${randLetter()}`,
    };
    if (formats[country]) return formats[country]();
    const len = Math.max(4, 6 - prefix.length);
    return `${prefix}${randDigits(len)}`;
}

function generatePhone(format) {
    return format.replace(/X/g, () => String(rand(10)));
}

const FIRST_NAMES = [
    "James", "John", "Robert", "Michael", "David", "William", "Richard", "Joseph",
    "Thomas", "Christopher", "Mary", "Patricia", "Jennifer", "Linda", "Barbara",
    "Elizabeth", "Susan", "Jessica", "Sarah", "Karen", "Daniel", "Matthew", "Anthony",
    "Mark", "Donald", "Steven", "Andrew", "Paul", "Joshua", "Kenneth",
];

const LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
    "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
];

const STREETS = [
    "Main St", "Oak Ave", "Maple Dr", "Cedar Ln", "Pine Rd", "Elm St", "Washington Blvd",
    "Park Ave", "Lake Dr", "Hill Rd", "River Rd", "Forest Ave", "Sunset Blvd",
    "Broadway", "Church St", "Market St", "Spring St", "Highland Ave", "Valley Rd",
    "Meadow Ln", "Willow Way", "Cherry Ln", "Birch St", "Walnut St", "Poplar Ave",
];

function generateFakeInfo(countryName, countryData) {
    const firstName = FIRST_NAMES[rand(FIRST_NAMES.length)];
    const lastName = LAST_NAMES[rand(LAST_NAMES.length)];
    const state = countryData.states[rand(countryData.states.length)];
    const city = state.cities[rand(state.cities.length)];
    const street = `${rand(9000) + 100} ${STREETS[rand(STREETS.length)]}`;
    const zip = generateZip(countryName, state.zipPrefix);
    const phone = `${countryData.phonePrefix} ${generatePhone(countryData.phoneFormat)}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${rand(99)}@gmail.com`;

    return {
        firstName,
        lastName,
        street,
        city,
        state: state.name,
        zip,
        country: countryName,
        phone,
        email,
    };
}

const COUNTRIES = {
  "Afghanistan": {
    phonePrefix: "+93", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Kabul", cities: ["Kabul", "Paghman"], zipPrefix: "10" },
      { name: "Herat", cities: ["Herat", "Injil"], zipPrefix: "30" },
    ],
  },
  "Albania": {
    phonePrefix: "+355", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Tirana", cities: ["Tirana", "Kamza"], zipPrefix: "10" },
      { name: "Durrës", cities: ["Durrës", "Shijak"], zipPrefix: "20" },
    ],
  },
  "Argentina": {
    phonePrefix: "+54", phoneFormat: "XX XXXX-XXXX",
    states: [
      { name: "Buenos Aires", cities: ["Buenos Aires", "La Plata", "Mar del Plata"], zipPrefix: "B" },
      { name: "Córdoba", cities: ["Córdoba", "Villa María"], zipPrefix: "X" },
    ],
  },
  "Australia": {
    phonePrefix: "+61", phoneFormat: "XXXX XXX XXX",
    states: [
      { name: "New South Wales", cities: ["Sydney", "Newcastle", "Wollongong"], zipPrefix: "2" },
      { name: "Victoria", cities: ["Melbourne", "Geelong", "Ballarat"], zipPrefix: "3" },
      { name: "Queensland", cities: ["Brisbane", "Gold Coast", "Sunshine Coast"], zipPrefix: "4" },
      { name: "Western Australia", cities: ["Perth", "Mandurah"], zipPrefix: "6" },
    ],
  },
  "Austria": {
    phonePrefix: "+43", phoneFormat: "XXX XXXXXXX",
    states: [
      { name: "Vienna", cities: ["Vienna"], zipPrefix: "1" },
      { name: "Salzburg", cities: ["Salzburg", "Hallein"], zipPrefix: "5" },
    ],
  },
  "Belgium": {
    phonePrefix: "+32", phoneFormat: "XXX XX XX XX",
    states: [
      { name: "Brussels", cities: ["Brussels", "Ixelles"], zipPrefix: "1" },
      { name: "Antwerp", cities: ["Antwerp", "Mechelen"], zipPrefix: "2" },
    ],
  },
  "Brazil": {
    phonePrefix: "+55", phoneFormat: "(XX) XXXXX-XXXX",
    states: [
      { name: "São Paulo", cities: ["São Paulo", "Campinas", "Santos"], zipPrefix: "0" },
      { name: "Rio de Janeiro", cities: ["Rio de Janeiro", "Niterói"], zipPrefix: "2" },
      { name: "Minas Gerais", cities: ["Belo Horizonte", "Uberlândia"], zipPrefix: "3" },
    ],
  },
  "Canada": {
    phonePrefix: "+1", phoneFormat: "(XXX) XXX-XXXX",
    states: [
      { name: "Ontario", cities: ["Toronto", "Ottawa", "Hamilton", "Mississauga"], zipPrefix: "K" },
      { name: "Quebec", cities: ["Montreal", "Quebec City", "Laval"], zipPrefix: "H" },
      { name: "British Columbia", cities: ["Vancouver", "Victoria", "Surrey"], zipPrefix: "V" },
      { name: "Alberta", cities: ["Calgary", "Edmonton"], zipPrefix: "T" },
    ],
  },
  "China": {
    phonePrefix: "+86", phoneFormat: "XXX XXXX XXXX",
    states: [
      { name: "Beijing", cities: ["Beijing", "Chaoyang"], zipPrefix: "10" },
      { name: "Shanghai", cities: ["Shanghai", "Pudong"], zipPrefix: "20" },
      { name: "Guangdong", cities: ["Guangzhou", "Shenzhen", "Dongguan"], zipPrefix: "51" },
    ],
  },
  "Colombia": {
    phonePrefix: "+57", phoneFormat: "XXX XXX XXXX",
    states: [
      { name: "Bogotá", cities: ["Bogotá"], zipPrefix: "11" },
      { name: "Antioquia", cities: ["Medellín", "Envigado"], zipPrefix: "05" },
    ],
  },
  "Czech Republic": {
    phonePrefix: "+420", phoneFormat: "XXX XXX XXX",
    states: [
      { name: "Prague", cities: ["Prague"], zipPrefix: "1" },
      { name: "South Moravia", cities: ["Brno"], zipPrefix: "6" },
    ],
  },
  "Denmark": {
    phonePrefix: "+45", phoneFormat: "XX XX XX XX",
    states: [
      { name: "Capital Region", cities: ["Copenhagen", "Frederiksberg"], zipPrefix: "1" },
      { name: "Central Jutland", cities: ["Aarhus"], zipPrefix: "8" },
    ],
  },
  "Egypt": {
    phonePrefix: "+20", phoneFormat: "XXX XXX XXXX",
    states: [
      { name: "Cairo", cities: ["Cairo", "Giza"], zipPrefix: "1" },
      { name: "Alexandria", cities: ["Alexandria"], zipPrefix: "2" },
    ],
  },
  "Finland": {
    phonePrefix: "+358", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Uusimaa", cities: ["Helsinki", "Espoo", "Vantaa"], zipPrefix: "0" },
      { name: "Pirkanmaa", cities: ["Tampere"], zipPrefix: "3" },
    ],
  },
  "France": {
    phonePrefix: "+33", phoneFormat: "X XX XX XX XX",
    states: [
      { name: "Île-de-France", cities: ["Paris", "Boulogne-Billancourt", "Versailles"], zipPrefix: "75" },
      { name: "Provence-Alpes-Côte d'Azur", cities: ["Marseille", "Nice", "Cannes"], zipPrefix: "13" },
      { name: "Auvergne-Rhône-Alpes", cities: ["Lyon", "Grenoble"], zipPrefix: "69" },
    ],
  },
  "Germany": {
    phonePrefix: "+49", phoneFormat: "XXXX XXXXXXX",
    states: [
      { name: "Bavaria", cities: ["Munich", "Nuremberg", "Augsburg"], zipPrefix: "8" },
      { name: "Berlin", cities: ["Berlin"], zipPrefix: "1" },
      { name: "Hamburg", cities: ["Hamburg"], zipPrefix: "2" },
      { name: "North Rhine-Westphalia", cities: ["Cologne", "Düsseldorf", "Dortmund"], zipPrefix: "4" },
    ],
  },
  "Greece": {
    phonePrefix: "+30", phoneFormat: "XXX XXX XXXX",
    states: [
      { name: "Attica", cities: ["Athens", "Piraeus"], zipPrefix: "1" },
      { name: "Central Macedonia", cities: ["Thessaloniki"], zipPrefix: "5" },
    ],
  },
  "India": {
    phonePrefix: "+91", phoneFormat: "XXXXX XXXXX",
    states: [
      { name: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur"], zipPrefix: "4" },
      { name: "Delhi", cities: ["New Delhi", "Dwarka"], zipPrefix: "1" },
      { name: "Karnataka", cities: ["Bangalore", "Mysore"], zipPrefix: "5" },
      { name: "Tamil Nadu", cities: ["Chennai", "Coimbatore"], zipPrefix: "6" },
    ],
  },
  "Indonesia": {
    phonePrefix: "+62", phoneFormat: "XXX-XXXX-XXXX",
    states: [
      { name: "Jakarta", cities: ["Jakarta", "South Jakarta"], zipPrefix: "1" },
      { name: "West Java", cities: ["Bandung", "Bekasi"], zipPrefix: "4" },
    ],
  },
  "Ireland": {
    phonePrefix: "+353", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Dublin", cities: ["Dublin", "Dún Laoghaire"], zipPrefix: "D" },
      { name: "Cork", cities: ["Cork", "Cobh"], zipPrefix: "T" },
    ],
  },
  "Israel": {
    phonePrefix: "+972", phoneFormat: "XX-XXX-XXXX",
    states: [
      { name: "Tel Aviv", cities: ["Tel Aviv", "Ramat Gan"], zipPrefix: "6" },
      { name: "Jerusalem", cities: ["Jerusalem"], zipPrefix: "9" },
    ],
  },
  "Italy": {
    phonePrefix: "+39", phoneFormat: "XXX XXX XXXX",
    states: [
      { name: "Lazio", cities: ["Rome", "Latina"], zipPrefix: "00" },
      { name: "Lombardy", cities: ["Milan", "Bergamo", "Brescia"], zipPrefix: "20" },
      { name: "Campania", cities: ["Naples", "Salerno"], zipPrefix: "80" },
    ],
  },
  "Japan": {
    phonePrefix: "+81", phoneFormat: "XXX-XXXX-XXXX",
    states: [
      { name: "Tokyo", cities: ["Shinjuku", "Shibuya", "Minato"], zipPrefix: "1" },
      { name: "Osaka", cities: ["Osaka", "Sakai"], zipPrefix: "5" },
      { name: "Kanagawa", cities: ["Yokohama", "Kawasaki"], zipPrefix: "2" },
    ],
  },
  "Malaysia": {
    phonePrefix: "+60", phoneFormat: "XX-XXXX XXXX",
    states: [
      { name: "Kuala Lumpur", cities: ["Kuala Lumpur", "Petaling Jaya"], zipPrefix: "5" },
      { name: "Selangor", cities: ["Shah Alam", "Subang Jaya"], zipPrefix: "4" },
    ],
  },
  "Mexico": {
    phonePrefix: "+52", phoneFormat: "XXX XXX XXXX",
    states: [
      { name: "Mexico City", cities: ["Mexico City", "Iztapalapa"], zipPrefix: "0" },
      { name: "Jalisco", cities: ["Guadalajara", "Zapopan"], zipPrefix: "4" },
    ],
  },
  "Netherlands": {
    phonePrefix: "+31", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "North Holland", cities: ["Amsterdam", "Haarlem"], zipPrefix: "" },
      { name: "South Holland", cities: ["Rotterdam", "The Hague"], zipPrefix: "" },
    ],
  },
  "New Zealand": {
    phonePrefix: "+64", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Auckland", cities: ["Auckland", "Manukau"], zipPrefix: "0" },
      { name: "Wellington", cities: ["Wellington"], zipPrefix: "6" },
    ],
  },
  "Nigeria": {
    phonePrefix: "+234", phoneFormat: "XXX XXX XXXX",
    states: [
      { name: "Lagos", cities: ["Lagos", "Ikeja"], zipPrefix: "1" },
      { name: "Abuja", cities: ["Abuja"], zipPrefix: "9" },
    ],
  },
  "Norway": {
    phonePrefix: "+47", phoneFormat: "XXX XX XXX",
    states: [
      { name: "Oslo", cities: ["Oslo"], zipPrefix: "0" },
      { name: "Vestland", cities: ["Bergen"], zipPrefix: "5" },
    ],
  },
  "Pakistan": {
    phonePrefix: "+92", phoneFormat: "XXX XXXXXXX",
    states: [
      { name: "Punjab", cities: ["Lahore", "Faisalabad", "Rawalpindi"], zipPrefix: "5" },
      { name: "Sindh", cities: ["Karachi", "Hyderabad"], zipPrefix: "7" },
      { name: "Islamabad", cities: ["Islamabad"], zipPrefix: "44" },
    ],
  },
  "Philippines": {
    phonePrefix: "+63", phoneFormat: "XXX XXX XXXX",
    states: [
      { name: "Metro Manila", cities: ["Manila", "Quezon City", "Makati"], zipPrefix: "1" },
      { name: "Cebu", cities: ["Cebu City", "Mandaue"], zipPrefix: "6" },
    ],
  },
  "Poland": {
    phonePrefix: "+48", phoneFormat: "XXX XXX XXX",
    states: [
      { name: "Masovia", cities: ["Warsaw", "Radom"], zipPrefix: "0" },
      { name: "Lesser Poland", cities: ["Kraków"], zipPrefix: "3" },
    ],
  },
  "Portugal": {
    phonePrefix: "+351", phoneFormat: "XXX XXX XXX",
    states: [
      { name: "Lisbon", cities: ["Lisbon", "Sintra"], zipPrefix: "1" },
      { name: "Porto", cities: ["Porto"], zipPrefix: "4" },
    ],
  },
  "Romania": {
    phonePrefix: "+40", phoneFormat: "XXX XXX XXX",
    states: [
      { name: "Bucharest", cities: ["Bucharest"], zipPrefix: "0" },
      { name: "Cluj", cities: ["Cluj-Napoca"], zipPrefix: "4" },
    ],
  },
  "Russia": {
    phonePrefix: "+7", phoneFormat: "XXX XXX-XX-XX",
    states: [
      { name: "Moscow", cities: ["Moscow"], zipPrefix: "1" },
      { name: "Saint Petersburg", cities: ["Saint Petersburg"], zipPrefix: "19" },
    ],
  },
  "Saudi Arabia": {
    phonePrefix: "+966", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Riyadh", cities: ["Riyadh"], zipPrefix: "1" },
      { name: "Makkah", cities: ["Jeddah", "Makkah"], zipPrefix: "2" },
    ],
  },
  "Singapore": {
    phonePrefix: "+65", phoneFormat: "XXXX XXXX",
    states: [{ name: "Singapore", cities: ["Singapore", "Jurong East", "Tampines"], zipPrefix: "" }],
  },
  "South Africa": {
    phonePrefix: "+27", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Gauteng", cities: ["Johannesburg", "Pretoria"], zipPrefix: "2" },
      { name: "Western Cape", cities: ["Cape Town"], zipPrefix: "7" },
    ],
  },
  "South Korea": {
    phonePrefix: "+82", phoneFormat: "XX-XXXX-XXXX",
    states: [
      { name: "Seoul", cities: ["Seoul", "Gangnam"], zipPrefix: "0" },
      { name: "Busan", cities: ["Busan"], zipPrefix: "4" },
    ],
  },
  "Spain": {
    phonePrefix: "+34", phoneFormat: "XXX XXX XXX",
    states: [
      { name: "Madrid", cities: ["Madrid", "Alcalá de Henares"], zipPrefix: "28" },
      { name: "Catalonia", cities: ["Barcelona", "Tarragona"], zipPrefix: "08" },
      { name: "Andalusia", cities: ["Seville", "Málaga"], zipPrefix: "41" },
    ],
  },
  "Sweden": {
    phonePrefix: "+46", phoneFormat: "XX-XXX XX XX",
    states: [
      { name: "Stockholm", cities: ["Stockholm", "Solna"], zipPrefix: "1" },
      { name: "Västra Götaland", cities: ["Gothenburg"], zipPrefix: "4" },
    ],
  },
  "Switzerland": {
    phonePrefix: "+41", phoneFormat: "XX XXX XX XX",
    states: [
      { name: "Zurich", cities: ["Zurich", "Winterthur"], zipPrefix: "8" },
      { name: "Bern", cities: ["Bern"], zipPrefix: "3" },
      { name: "Geneva", cities: ["Geneva"], zipPrefix: "1" },
    ],
  },
  "Taiwan": {
    phonePrefix: "+886", phoneFormat: "X XXXX XXXX",
    states: [
      { name: "Taipei", cities: ["Taipei", "Xinbei"], zipPrefix: "1" },
      { name: "Kaohsiung", cities: ["Kaohsiung"], zipPrefix: "8" },
    ],
  },
  "Thailand": {
    phonePrefix: "+66", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Bangkok", cities: ["Bangkok", "Nonthaburi"], zipPrefix: "1" },
      { name: "Chiang Mai", cities: ["Chiang Mai"], zipPrefix: "5" },
    ],
  },
  "Turkey": {
    phonePrefix: "+90", phoneFormat: "XXX XXX XXXX",
    states: [
      { name: "Istanbul", cities: ["Istanbul", "Kadıköy"], zipPrefix: "34" },
      { name: "Ankara", cities: ["Ankara"], zipPrefix: "06" },
    ],
  },
  "Ukraine": {
    phonePrefix: "+380", phoneFormat: "XX XXX XX XX",
    states: [
      { name: "Kyiv", cities: ["Kyiv"], zipPrefix: "01" },
      { name: "Kharkiv", cities: ["Kharkiv"], zipPrefix: "61" },
    ],
  },
  "United Arab Emirates": {
    phonePrefix: "+971", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Dubai", cities: ["Dubai", "Deira", "Jumeirah"], zipPrefix: "" },
      { name: "Abu Dhabi", cities: ["Abu Dhabi", "Al Ain"], zipPrefix: "" },
    ],
  },
  "United Kingdom": {
    phonePrefix: "+44", phoneFormat: "XXXX XXXXXX",
    states: [
      { name: "England", cities: ["London", "Manchester", "Birmingham", "Liverpool", "Leeds"], zipPrefix: "" },
      { name: "Scotland", cities: ["Edinburgh", "Glasgow"], zipPrefix: "" },
      { name: "Wales", cities: ["Cardiff", "Swansea"], zipPrefix: "" },
    ],
  },
  "United States": {
    phonePrefix: "+1", phoneFormat: "(XXX) XXX-XXXX",
    states: [
      { name: "California", cities: ["Los Angeles", "San Francisco", "San Diego", "Sacramento"], zipPrefix: "9" },
      { name: "New York", cities: ["New York City", "Buffalo", "Rochester"], zipPrefix: "1" },
      { name: "Texas", cities: ["Houston", "Dallas", "Austin", "San Antonio"], zipPrefix: "7" },
      { name: "Florida", cities: ["Miami", "Orlando", "Tampa"], zipPrefix: "3" },
      { name: "Illinois", cities: ["Chicago", "Springfield"], zipPrefix: "6" },
      { name: "Washington", cities: ["Seattle", "Tacoma", "Spokane"], zipPrefix: "9" },
      { name: "Arizona", cities: ["Phoenix", "Tucson", "Scottsdale"], zipPrefix: "8" },
      { name: "Colorado", cities: ["Denver", "Colorado Springs"], zipPrefix: "8" },
    ],
  },
  "Vietnam": {
    phonePrefix: "+84", phoneFormat: "XXX XXX XXXX",
    states: [
      { name: "Ho Chi Minh City", cities: ["Ho Chi Minh City", "Thủ Đức"], zipPrefix: "7" },
      { name: "Hanoi", cities: ["Hanoi"], zipPrefix: "1" },
      { name: "Da Nang", cities: ["Da Nang"], zipPrefix: "5" },
    ],
  },
};

module.exports = { COUNTRIES, generateFakeInfo };
