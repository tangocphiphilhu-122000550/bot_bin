// Complete country data for fake address generation
// Each country has: phone prefix/format, states/regions with cities and zip prefixes

export interface CountryData {
  phonePrefix: string;
  phoneFormat: string;
  states: { name: string; cities: string[]; zipPrefix: string }[];
}

const rand = (max: number) => Math.floor(Math.random() * max);
const randDigits = (n: number) => Array.from({ length: n }, () => rand(10)).join("");
const randLetter = () => String.fromCharCode(65 + rand(26));

export function generateZip(country: string, prefix: string): string {
  // Country-specific zip formats
  const formats: Record<string, () => string> = {
    "United Kingdom": () => `${randLetter()}${randLetter()}${rand(10)}${rand(10)} ${rand(10)}${randLetter()}${randLetter()}`,
    "Canada": () => `${prefix}${rand(10)}${randLetter()} ${rand(10)}${randLetter()}${rand(10)}`,
    "Netherlands": () => `${randDigits(4)} ${randLetter()}${randLetter()}`,
    "Brazil": () => `${prefix}${randDigits(4)}-${randDigits(3)}`,
    "Japan": () => `${prefix}${randDigits(2)}-${randDigits(4)}`,
    "Ireland": () => `${randLetter()}${randDigits(2)} ${randLetter()}${randLetter()}${randDigits(2)}`,
    "Argentina": () => `${randLetter()}${randDigits(4)}${randLetter()}${randLetter()}${randLetter()}`,
  };
  if (formats[country]) return formats[country]();
  // Generic: use prefix + enough digits to make 4-6 char zip
  const len = Math.max(4, 6 - prefix.length);
  return `${prefix}${randDigits(len)}`;
}

export function generatePhone(format: string): string {
  return format.replace(/X/g, () => String(rand(10)));
}

export const COUNTRIES: Record<string, CountryData> = {
  "Afghanistan": {
    phonePrefix: "+93", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Kabul", cities: ["Kabul", "Paghman"], zipPrefix: "10" },
      { name: "Herat", cities: ["Herat", "Injil"], zipPrefix: "30" },
      { name: "Kandahar", cities: ["Kandahar", "Spin Boldak"], zipPrefix: "31" },
    ],
  },
  "Albania": {
    phonePrefix: "+355", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Tirana", cities: ["Tirana", "Kamza"], zipPrefix: "10" },
      { name: "Durrës", cities: ["Durrës", "Shijak"], zipPrefix: "20" },
    ],
  },
  "Algeria": {
    phonePrefix: "+213", phoneFormat: "XXX XX XX XX",
    states: [
      { name: "Algiers", cities: ["Algiers", "Bab El Oued"], zipPrefix: "16" },
      { name: "Oran", cities: ["Oran", "Bir El Djir"], zipPrefix: "31" },
      { name: "Constantine", cities: ["Constantine"], zipPrefix: "25" },
    ],
  },
  "American Samoa": {
    phonePrefix: "+1", phoneFormat: "(XXX) XXX-XXXX",
    states: [{ name: "American Samoa", cities: ["Pago Pago", "Tafuna"], zipPrefix: "967" }],
  },
  "Andorra": {
    phonePrefix: "+376", phoneFormat: "XXX XXX",
    states: [{ name: "Andorra la Vella", cities: ["Andorra la Vella", "Escaldes-Engordany"], zipPrefix: "AD" }],
  },
  "Angola": {
    phonePrefix: "+244", phoneFormat: "XXX XXX XXX",
    states: [
      { name: "Luanda", cities: ["Luanda", "Viana"], zipPrefix: "" },
      { name: "Benguela", cities: ["Benguela", "Lobito"], zipPrefix: "" },
    ],
  },
  "Antigua and Barbuda": {
    phonePrefix: "+1", phoneFormat: "(XXX) XXX-XXXX",
    states: [{ name: "Saint John", cities: ["St. John's", "All Saints"], zipPrefix: "" }],
  },
  "Argentina": {
    phonePrefix: "+54", phoneFormat: "XX XXXX-XXXX",
    states: [
      { name: "Buenos Aires", cities: ["Buenos Aires", "La Plata", "Mar del Plata"], zipPrefix: "B" },
      { name: "Córdoba", cities: ["Córdoba", "Villa María"], zipPrefix: "X" },
      { name: "Santa Fe", cities: ["Rosario", "Santa Fe"], zipPrefix: "S" },
    ],
  },
  "Armenia": {
    phonePrefix: "+374", phoneFormat: "XX XXXXXX",
    states: [
      { name: "Yerevan", cities: ["Yerevan"], zipPrefix: "00" },
      { name: "Shirak", cities: ["Gyumri"], zipPrefix: "31" },
    ],
  },
  "Australia": {
    phonePrefix: "+61", phoneFormat: "XXXX XXX XXX",
    states: [
      { name: "New South Wales", cities: ["Sydney", "Newcastle", "Wollongong", "Central Coast"], zipPrefix: "2" },
      { name: "Victoria", cities: ["Melbourne", "Geelong", "Ballarat", "Bendigo"], zipPrefix: "3" },
      { name: "Queensland", cities: ["Brisbane", "Gold Coast", "Sunshine Coast", "Townsville", "Cairns"], zipPrefix: "4" },
      { name: "Western Australia", cities: ["Perth", "Mandurah", "Bunbury"], zipPrefix: "6" },
      { name: "South Australia", cities: ["Adelaide", "Mount Gambier"], zipPrefix: "5" },
    ],
  },
  "Austria": {
    phonePrefix: "+43", phoneFormat: "XXX XXXXXXX",
    states: [
      { name: "Vienna", cities: ["Vienna"], zipPrefix: "1" },
      { name: "Salzburg", cities: ["Salzburg", "Hallein"], zipPrefix: "5" },
      { name: "Tyrol", cities: ["Innsbruck", "Kufstein"], zipPrefix: "6" },
    ],
  },
  "Azerbaijan": {
    phonePrefix: "+994", phoneFormat: "XX XXX XX XX",
    states: [
      { name: "Baku", cities: ["Baku", "Sumgait"], zipPrefix: "AZ1" },
      { name: "Ganja", cities: ["Ganja"], zipPrefix: "AZ2" },
    ],
  },
  "Bahamas": {
    phonePrefix: "+1", phoneFormat: "(XXX) XXX-XXXX",
    states: [{ name: "New Providence", cities: ["Nassau", "Freeport"], zipPrefix: "" }],
  },
  "Bahrain": {
    phonePrefix: "+973", phoneFormat: "XXXX XXXX",
    states: [{ name: "Capital", cities: ["Manama", "Muharraq", "Riffa"], zipPrefix: "" }],
  },
  "Bangladesh": {
    phonePrefix: "+880", phoneFormat: "XXXX-XXXXXX",
    states: [
      { name: "Dhaka", cities: ["Dhaka", "Gazipur", "Narayanganj"], zipPrefix: "1" },
      { name: "Chittagong", cities: ["Chittagong", "Comilla"], zipPrefix: "4" },
    ],
  },
  "Barbados": {
    phonePrefix: "+1", phoneFormat: "(XXX) XXX-XXXX",
    states: [{ name: "Saint Michael", cities: ["Bridgetown", "Speightstown"], zipPrefix: "BB" }],
  },
  "Belarus": {
    phonePrefix: "+375", phoneFormat: "XX XXX-XX-XX",
    states: [
      { name: "Minsk", cities: ["Minsk"], zipPrefix: "22" },
      { name: "Gomel", cities: ["Gomel"], zipPrefix: "24" },
    ],
  },
  "Belgium": {
    phonePrefix: "+32", phoneFormat: "XXX XX XX XX",
    states: [
      { name: "Brussels", cities: ["Brussels", "Ixelles"], zipPrefix: "1" },
      { name: "Antwerp", cities: ["Antwerp", "Mechelen"], zipPrefix: "2" },
      { name: "Ghent", cities: ["Ghent", "Bruges"], zipPrefix: "9" },
    ],
  },
  "Belize": {
    phonePrefix: "+501", phoneFormat: "XXX-XXXX",
    states: [{ name: "Belize", cities: ["Belize City", "Belmopan"], zipPrefix: "" }],
  },
  "Benin": {
    phonePrefix: "+229", phoneFormat: "XX XX XX XX",
    states: [{ name: "Littoral", cities: ["Cotonou", "Porto-Novo"], zipPrefix: "" }],
  },
  "Bermuda": {
    phonePrefix: "+1", phoneFormat: "(XXX) XXX-XXXX",
    states: [{ name: "Bermuda", cities: ["Hamilton", "Saint George"], zipPrefix: "" }],
  },
  "Bhutan": {
    phonePrefix: "+975", phoneFormat: "XX XXX XXX",
    states: [{ name: "Thimphu", cities: ["Thimphu", "Paro"], zipPrefix: "" }],
  },
  "Bolivia": {
    phonePrefix: "+591", phoneFormat: "X XXXXXXX",
    states: [
      { name: "La Paz", cities: ["La Paz", "El Alto"], zipPrefix: "" },
      { name: "Santa Cruz", cities: ["Santa Cruz de la Sierra"], zipPrefix: "" },
    ],
  },
  "Bosnia and Herzegovina": {
    phonePrefix: "+387", phoneFormat: "XX XXX-XXX",
    states: [
      { name: "Sarajevo", cities: ["Sarajevo"], zipPrefix: "71" },
      { name: "Banja Luka", cities: ["Banja Luka"], zipPrefix: "78" },
    ],
  },
  "Botswana": {
    phonePrefix: "+267", phoneFormat: "XX XXX XXX",
    states: [{ name: "South-East", cities: ["Gaborone", "Francistown"], zipPrefix: "" }],
  },
  "Brazil": {
    phonePrefix: "+55", phoneFormat: "(XX) XXXXX-XXXX",
    states: [
      { name: "São Paulo", cities: ["São Paulo", "Campinas", "Santos", "Guarulhos"], zipPrefix: "0" },
      { name: "Rio de Janeiro", cities: ["Rio de Janeiro", "Niterói", "Petrópolis"], zipPrefix: "2" },
      { name: "Minas Gerais", cities: ["Belo Horizonte", "Uberlândia", "Juiz de Fora"], zipPrefix: "3" },
      { name: "Bahia", cities: ["Salvador", "Feira de Santana"], zipPrefix: "4" },
      { name: "Paraná", cities: ["Curitiba", "Londrina", "Maringá"], zipPrefix: "8" },
    ],
  },
  "Brunei": {
    phonePrefix: "+673", phoneFormat: "XXX XXXX",
    states: [{ name: "Brunei-Muara", cities: ["Bandar Seri Begawan"], zipPrefix: "B" }],
  },
  "Bulgaria": {
    phonePrefix: "+359", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Sofia", cities: ["Sofia", "Pernik"], zipPrefix: "1" },
      { name: "Plovdiv", cities: ["Plovdiv"], zipPrefix: "4" },
    ],
  },
  "Burkina Faso": {
    phonePrefix: "+226", phoneFormat: "XX XX XX XX",
    states: [{ name: "Centre", cities: ["Ouagadougou", "Bobo-Dioulasso"], zipPrefix: "" }],
  },
  "Burundi": {
    phonePrefix: "+257", phoneFormat: "XX XX XX XX",
    states: [{ name: "Bujumbura", cities: ["Bujumbura", "Gitega"], zipPrefix: "" }],
  },
  "Cameroon": {
    phonePrefix: "+237", phoneFormat: "X XX XX XX XX",
    states: [
      { name: "Centre", cities: ["Yaoundé"], zipPrefix: "" },
      { name: "Littoral", cities: ["Douala"], zipPrefix: "" },
    ],
  },
  "Canada": {
    phonePrefix: "+1", phoneFormat: "(XXX) XXX-XXXX",
    states: [
      { name: "Ontario", cities: ["Toronto", "Ottawa", "Hamilton", "London", "Mississauga"], zipPrefix: "K" },
      { name: "Quebec", cities: ["Montreal", "Quebec City", "Laval", "Gatineau"], zipPrefix: "H" },
      { name: "British Columbia", cities: ["Vancouver", "Victoria", "Surrey", "Burnaby"], zipPrefix: "V" },
      { name: "Alberta", cities: ["Calgary", "Edmonton", "Red Deer", "Lethbridge"], zipPrefix: "T" },
      { name: "Manitoba", cities: ["Winnipeg", "Brandon"], zipPrefix: "R" },
      { name: "Saskatchewan", cities: ["Saskatoon", "Regina"], zipPrefix: "S" },
    ],
  },
  "Cape Verde": {
    phonePrefix: "+238", phoneFormat: "XXX XX XX",
    states: [{ name: "Santiago", cities: ["Praia"], zipPrefix: "" }],
  },
  "Caribbean Netherlands": {
    phonePrefix: "+599", phoneFormat: "XXX XXXX",
    states: [{ name: "Bonaire", cities: ["Kralendijk"], zipPrefix: "" }],
  },
  "Central African Republic": {
    phonePrefix: "+236", phoneFormat: "XX XX XX XX",
    states: [{ name: "Bangui", cities: ["Bangui"], zipPrefix: "" }],
  },
  "Chile": {
    phonePrefix: "+56", phoneFormat: "X XXXX XXXX",
    states: [
      { name: "Santiago", cities: ["Santiago", "Puente Alto", "Maipú"], zipPrefix: "" },
      { name: "Valparaíso", cities: ["Valparaíso", "Viña del Mar"], zipPrefix: "" },
    ],
  },
  "China": {
    phonePrefix: "+86", phoneFormat: "XXX XXXX XXXX",
    states: [
      { name: "Beijing", cities: ["Beijing", "Chaoyang", "Haidian"], zipPrefix: "10" },
      { name: "Shanghai", cities: ["Shanghai", "Pudong", "Minhang"], zipPrefix: "20" },
      { name: "Guangdong", cities: ["Guangzhou", "Shenzhen", "Dongguan", "Foshan"], zipPrefix: "51" },
      { name: "Zhejiang", cities: ["Hangzhou", "Ningbo", "Wenzhou"], zipPrefix: "31" },
      { name: "Jiangsu", cities: ["Nanjing", "Suzhou", "Wuxi"], zipPrefix: "21" },
    ],
  },
  "Colombia": {
    phonePrefix: "+57", phoneFormat: "XXX XXX XXXX",
    states: [
      { name: "Bogotá", cities: ["Bogotá"], zipPrefix: "11" },
      { name: "Antioquia", cities: ["Medellín", "Envigado"], zipPrefix: "05" },
      { name: "Valle del Cauca", cities: ["Cali"], zipPrefix: "76" },
    ],
  },
  "Congo (DRC)": {
    phonePrefix: "+243", phoneFormat: "XX XXX XXXX",
    states: [{ name: "Kinshasa", cities: ["Kinshasa", "Lubumbashi"], zipPrefix: "" }],
  },
  "Costa Rica": {
    phonePrefix: "+506", phoneFormat: "XXXX-XXXX",
    states: [{ name: "San José", cities: ["San José", "Alajuela", "Heredia"], zipPrefix: "1" }],
  },
  "Côte d'Ivoire": {
    phonePrefix: "+225", phoneFormat: "XX XX XX XX XX",
    states: [{ name: "Abidjan", cities: ["Abidjan", "Yamoussoukro"], zipPrefix: "" }],
  },
  "Croatia": {
    phonePrefix: "+385", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Zagreb", cities: ["Zagreb"], zipPrefix: "10" },
      { name: "Split-Dalmatia", cities: ["Split", "Dubrovnik"], zipPrefix: "21" },
    ],
  },
  "Cuba": {
    phonePrefix: "+53", phoneFormat: "X XXXXXXX",
    states: [{ name: "Havana", cities: ["Havana", "Santiago de Cuba"], zipPrefix: "1" }],
  },
  "Cyprus": {
    phonePrefix: "+357", phoneFormat: "XX XXXXXX",
    states: [
      { name: "Nicosia", cities: ["Nicosia"], zipPrefix: "1" },
      { name: "Limassol", cities: ["Limassol"], zipPrefix: "3" },
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
      { name: "Central Jutland", cities: ["Aarhus", "Herning"], zipPrefix: "8" },
    ],
  },
  "Djibouti": {
    phonePrefix: "+253", phoneFormat: "XX XX XX XX",
    states: [{ name: "Djibouti", cities: ["Djibouti"], zipPrefix: "" }],
  },
  "Dominica": {
    phonePrefix: "+1", phoneFormat: "(XXX) XXX-XXXX",
    states: [{ name: "Saint George", cities: ["Roseau"], zipPrefix: "" }],
  },
  "Dominican Republic": {
    phonePrefix: "+1", phoneFormat: "(XXX) XXX-XXXX",
    states: [{ name: "Santo Domingo", cities: ["Santo Domingo", "Santiago"], zipPrefix: "1" }],
  },
  "Ecuador": {
    phonePrefix: "+593", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Pichincha", cities: ["Quito"], zipPrefix: "17" },
      { name: "Guayas", cities: ["Guayaquil"], zipPrefix: "09" },
    ],
  },
  "Egypt": {
    phonePrefix: "+20", phoneFormat: "XXX XXX XXXX",
    states: [
      { name: "Cairo", cities: ["Cairo", "Giza"], zipPrefix: "1" },
      { name: "Alexandria", cities: ["Alexandria"], zipPrefix: "2" },
    ],
  },
  "Eritrea": {
    phonePrefix: "+291", phoneFormat: "X XXX XXX",
    states: [{ name: "Maekel", cities: ["Asmara"], zipPrefix: "" }],
  },
  "Estonia": {
    phonePrefix: "+372", phoneFormat: "XXXX XXXX",
    states: [
      { name: "Harju", cities: ["Tallinn"], zipPrefix: "1" },
      { name: "Tartu", cities: ["Tartu"], zipPrefix: "5" },
    ],
  },
  "Ethiopia": {
    phonePrefix: "+251", phoneFormat: "XX XXX XXXX",
    states: [{ name: "Addis Ababa", cities: ["Addis Ababa"], zipPrefix: "1" }],
  },
  "Fiji": {
    phonePrefix: "+679", phoneFormat: "XXX XXXX",
    states: [{ name: "Central", cities: ["Suva", "Nadi"], zipPrefix: "" }],
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
      { name: "Île-de-France", cities: ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Versailles"], zipPrefix: "75" },
      { name: "Provence-Alpes-Côte d'Azur", cities: ["Marseille", "Nice", "Toulon", "Cannes"], zipPrefix: "13" },
      { name: "Auvergne-Rhône-Alpes", cities: ["Lyon", "Grenoble", "Saint-Étienne"], zipPrefix: "69" },
      { name: "Nouvelle-Aquitaine", cities: ["Bordeaux", "Limoges"], zipPrefix: "33" },
      { name: "Occitanie", cities: ["Toulouse", "Montpellier", "Nîmes"], zipPrefix: "31" },
    ],
  },
  "Gabon": {
    phonePrefix: "+241", phoneFormat: "XX XX XX XX",
    states: [{ name: "Estuaire", cities: ["Libreville"], zipPrefix: "" }],
  },
  "Georgia": {
    phonePrefix: "+995", phoneFormat: "XXX XX XX XX",
    states: [
      { name: "Tbilisi", cities: ["Tbilisi"], zipPrefix: "01" },
      { name: "Adjara", cities: ["Batumi"], zipPrefix: "61" },
    ],
  },
  "Germany": {
    phonePrefix: "+49", phoneFormat: "XXXX XXXXXXX",
    states: [
      { name: "Bavaria", cities: ["Munich", "Nuremberg", "Augsburg", "Regensburg"], zipPrefix: "8" },
      { name: "Berlin", cities: ["Berlin"], zipPrefix: "1" },
      { name: "Hamburg", cities: ["Hamburg"], zipPrefix: "2" },
      { name: "Hesse", cities: ["Frankfurt", "Wiesbaden", "Kassel", "Darmstadt"], zipPrefix: "6" },
      { name: "North Rhine-Westphalia", cities: ["Cologne", "Düsseldorf", "Dortmund", "Essen"], zipPrefix: "4" },
      { name: "Baden-Württemberg", cities: ["Stuttgart", "Mannheim", "Karlsruhe", "Freiburg"], zipPrefix: "7" },
    ],
  },
  "Greece": {
    phonePrefix: "+30", phoneFormat: "XXX XXX XXXX",
    states: [
      { name: "Attica", cities: ["Athens", "Piraeus"], zipPrefix: "1" },
      { name: "Central Macedonia", cities: ["Thessaloniki"], zipPrefix: "5" },
    ],
  },
  "Grenada": {
    phonePrefix: "+1", phoneFormat: "(XXX) XXX-XXXX",
    states: [{ name: "Saint George", cities: ["Saint George's"], zipPrefix: "" }],
  },
  "Hungary": {
    phonePrefix: "+36", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Budapest", cities: ["Budapest"], zipPrefix: "1" },
      { name: "Hajdú-Bihar", cities: ["Debrecen"], zipPrefix: "4" },
    ],
  },
  "Iceland": {
    phonePrefix: "+354", phoneFormat: "XXX XXXX",
    states: [{ name: "Capital Region", cities: ["Reykjavik", "Kópavogur"], zipPrefix: "1" }],
  },
  "India": {
    phonePrefix: "+91", phoneFormat: "XXXXX XXXXX",
    states: [
      { name: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Nashik"], zipPrefix: "4" },
      { name: "Delhi", cities: ["New Delhi", "Dwarka", "Rohini"], zipPrefix: "1" },
      { name: "Karnataka", cities: ["Bangalore", "Mysore", "Hubli", "Mangalore"], zipPrefix: "5" },
      { name: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai"], zipPrefix: "6" },
      { name: "West Bengal", cities: ["Kolkata", "Howrah", "Durgapur"], zipPrefix: "7" },
      { name: "Uttar Pradesh", cities: ["Lucknow", "Kanpur", "Agra", "Varanasi"], zipPrefix: "2" },
    ],
  },
  "Indonesia": {
    phonePrefix: "+62", phoneFormat: "XXX-XXXX-XXXX",
    states: [
      { name: "Jakarta", cities: ["Jakarta", "South Jakarta", "East Jakarta"], zipPrefix: "1" },
      { name: "West Java", cities: ["Bandung", "Bekasi", "Bogor"], zipPrefix: "4" },
      { name: "East Java", cities: ["Surabaya", "Malang"], zipPrefix: "6" },
    ],
  },
  "Iran": {
    phonePrefix: "+98", phoneFormat: "XXX XXX XXXX",
    states: [
      { name: "Tehran", cities: ["Tehran", "Karaj"], zipPrefix: "1" },
      { name: "Isfahan", cities: ["Isfahan"], zipPrefix: "8" },
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
      { name: "Lazio", cities: ["Rome", "Latina", "Frosinone"], zipPrefix: "00" },
      { name: "Lombardy", cities: ["Milan", "Bergamo", "Brescia", "Como"], zipPrefix: "20" },
      { name: "Campania", cities: ["Naples", "Salerno", "Caserta"], zipPrefix: "80" },
      { name: "Veneto", cities: ["Venice", "Verona", "Padua"], zipPrefix: "30" },
      { name: "Tuscany", cities: ["Florence", "Pisa", "Siena"], zipPrefix: "50" },
    ],
  },
  "Japan": {
    phonePrefix: "+81", phoneFormat: "XXX-XXXX-XXXX",
    states: [
      { name: "Tokyo", cities: ["Shinjuku", "Shibuya", "Minato", "Chiyoda", "Setagaya"], zipPrefix: "1" },
      { name: "Osaka", cities: ["Osaka", "Sakai", "Higashiosaka"], zipPrefix: "5" },
      { name: "Kanagawa", cities: ["Yokohama", "Kawasaki", "Sagamihara"], zipPrefix: "2" },
      { name: "Aichi", cities: ["Nagoya", "Toyota"], zipPrefix: "4" },
    ],
  },
  "Jordan": {
    phonePrefix: "+962", phoneFormat: "X XXXX XXXX",
    states: [
      { name: "Amman", cities: ["Amman"], zipPrefix: "1" },
      { name: "Irbid", cities: ["Irbid"], zipPrefix: "2" },
    ],
  },
  "Kazakhstan": {
    phonePrefix: "+7", phoneFormat: "XXX XXX XX XX",
    states: [
      { name: "Almaty", cities: ["Almaty"], zipPrefix: "05" },
      { name: "Astana", cities: ["Astana"], zipPrefix: "01" },
    ],
  },
  "Latvia": {
    phonePrefix: "+371", phoneFormat: "XXXX XXXX",
    states: [
      { name: "Riga", cities: ["Riga"], zipPrefix: "LV-1" },
      { name: "Daugavpils", cities: ["Daugavpils"], zipPrefix: "LV-5" },
    ],
  },
  "Lithuania": {
    phonePrefix: "+370", phoneFormat: "XXX XXXXX",
    states: [
      { name: "Vilnius", cities: ["Vilnius"], zipPrefix: "LT-0" },
      { name: "Kaunas", cities: ["Kaunas"], zipPrefix: "LT-4" },
    ],
  },
  "Malaysia": {
    phonePrefix: "+60", phoneFormat: "XX-XXXX XXXX",
    states: [
      { name: "Kuala Lumpur", cities: ["Kuala Lumpur", "Petaling Jaya"], zipPrefix: "5" },
      { name: "Selangor", cities: ["Shah Alam", "Subang Jaya"], zipPrefix: "4" },
      { name: "Penang", cities: ["George Town", "Butterworth"], zipPrefix: "1" },
    ],
  },
  "Mexico": {
    phonePrefix: "+52", phoneFormat: "XXX XXX XXXX",
    states: [
      { name: "Mexico City", cities: ["Mexico City", "Iztapalapa", "Ecatepec"], zipPrefix: "0" },
      { name: "Jalisco", cities: ["Guadalajara", "Zapopan", "Tlaquepaque"], zipPrefix: "4" },
      { name: "Nuevo León", cities: ["Monterrey", "San Pedro", "Apodaca"], zipPrefix: "6" },
    ],
  },
  "Moldova": {
    phonePrefix: "+373", phoneFormat: "XX XXX XXX",
    states: [{ name: "Chișinău", cities: ["Chișinău"], zipPrefix: "MD-2" }],
  },
  "Montenegro": {
    phonePrefix: "+382", phoneFormat: "XX XXX XXX",
    states: [
      { name: "Podgorica", cities: ["Podgorica"], zipPrefix: "81" },
      { name: "Budva", cities: ["Budva"], zipPrefix: "85" },
    ],
  },
  "Nepal": {
    phonePrefix: "+977", phoneFormat: "XXX-XXXXXXX",
    states: [
      { name: "Bagmati", cities: ["Kathmandu", "Lalitpur"], zipPrefix: "44" },
      { name: "Gandaki", cities: ["Pokhara"], zipPrefix: "33" },
    ],
  },
  "Netherlands": {
    phonePrefix: "+31", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "North Holland", cities: ["Amsterdam", "Haarlem"], zipPrefix: "" },
      { name: "South Holland", cities: ["Rotterdam", "The Hague", "Leiden"], zipPrefix: "" },
      { name: "Utrecht", cities: ["Utrecht"], zipPrefix: "" },
    ],
  },
  "New Zealand": {
    phonePrefix: "+64", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Auckland", cities: ["Auckland", "Manukau"], zipPrefix: "0" },
      { name: "Wellington", cities: ["Wellington", "Lower Hutt"], zipPrefix: "6" },
      { name: "Canterbury", cities: ["Christchurch"], zipPrefix: "8" },
    ],
  },
  "Nigeria": {
    phonePrefix: "+234", phoneFormat: "XXX XXX XXXX",
    states: [
      { name: "Lagos", cities: ["Lagos", "Ikeja", "Victoria Island"], zipPrefix: "1" },
      { name: "Abuja", cities: ["Abuja", "Garki"], zipPrefix: "9" },
      { name: "Rivers", cities: ["Port Harcourt"], zipPrefix: "5" },
    ],
  },
  "Norway": {
    phonePrefix: "+47", phoneFormat: "XXX XX XXX",
    states: [
      { name: "Oslo", cities: ["Oslo"], zipPrefix: "0" },
      { name: "Vestland", cities: ["Bergen"], zipPrefix: "5" },
      { name: "Trøndelag", cities: ["Trondheim"], zipPrefix: "7" },
    ],
  },
  "Peru": {
    phonePrefix: "+51", phoneFormat: "XXX XXX XXX",
    states: [
      { name: "Lima", cities: ["Lima", "Callao", "Miraflores"], zipPrefix: "15" },
      { name: "Arequipa", cities: ["Arequipa"], zipPrefix: "04" },
    ],
  },
  "Philippines": {
    phonePrefix: "+63", phoneFormat: "XXX XXX XXXX",
    states: [
      { name: "Metro Manila", cities: ["Manila", "Quezon City", "Makati", "Taguig"], zipPrefix: "1" },
      { name: "Cebu", cities: ["Cebu City", "Mandaue"], zipPrefix: "6" },
    ],
  },
  "Poland": {
    phonePrefix: "+48", phoneFormat: "XXX XXX XXX",
    states: [
      { name: "Masovia", cities: ["Warsaw", "Radom"], zipPrefix: "0" },
      { name: "Lesser Poland", cities: ["Kraków", "Tarnów"], zipPrefix: "3" },
      { name: "Silesia", cities: ["Katowice", "Częstochowa"], zipPrefix: "4" },
    ],
  },
  "Portugal": {
    phonePrefix: "+351", phoneFormat: "XXX XXX XXX",
    states: [
      { name: "Lisbon", cities: ["Lisbon", "Sintra", "Cascais"], zipPrefix: "1" },
      { name: "Porto", cities: ["Porto", "Vila Nova de Gaia"], zipPrefix: "4" },
    ],
  },
  "Republic of the Congo": {
    phonePrefix: "+242", phoneFormat: "XX XXX XXXX",
    states: [{ name: "Brazzaville", cities: ["Brazzaville", "Pointe-Noire"], zipPrefix: "" }],
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
      { name: "Novosibirsk Oblast", cities: ["Novosibirsk"], zipPrefix: "63" },
    ],
  },
  "Saudi Arabia": {
    phonePrefix: "+966", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Riyadh", cities: ["Riyadh"], zipPrefix: "1" },
      { name: "Makkah", cities: ["Jeddah", "Makkah"], zipPrefix: "2" },
    ],
  },
  "Serbia": {
    phonePrefix: "+381", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Belgrade", cities: ["Belgrade"], zipPrefix: "11" },
      { name: "Vojvodina", cities: ["Novi Sad"], zipPrefix: "21" },
    ],
  },
  "Singapore": {
    phonePrefix: "+65", phoneFormat: "XXXX XXXX",
    states: [{ name: "Singapore", cities: ["Singapore", "Jurong East", "Tampines", "Woodlands"], zipPrefix: "" }],
  },
  "Slovakia": {
    phonePrefix: "+421", phoneFormat: "XXX XXX XXX",
    states: [
      { name: "Bratislava", cities: ["Bratislava"], zipPrefix: "8" },
      { name: "Košice", cities: ["Košice"], zipPrefix: "0" },
    ],
  },
  "Slovenia": {
    phonePrefix: "+386", phoneFormat: "XX XXX XXX",
    states: [
      { name: "Ljubljana", cities: ["Ljubljana"], zipPrefix: "1" },
      { name: "Maribor", cities: ["Maribor"], zipPrefix: "2" },
    ],
  },
  "South Africa": {
    phonePrefix: "+27", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Gauteng", cities: ["Johannesburg", "Pretoria", "Sandton"], zipPrefix: "2" },
      { name: "Western Cape", cities: ["Cape Town", "Stellenbosch"], zipPrefix: "7" },
      { name: "KwaZulu-Natal", cities: ["Durban", "Pietermaritzburg"], zipPrefix: "4" },
    ],
  },
  "South Korea": {
    phonePrefix: "+82", phoneFormat: "XX-XXXX-XXXX",
    states: [
      { name: "Seoul", cities: ["Seoul", "Gangnam", "Jongno"], zipPrefix: "0" },
      { name: "Busan", cities: ["Busan"], zipPrefix: "4" },
      { name: "Incheon", cities: ["Incheon"], zipPrefix: "2" },
    ],
  },
  "Spain": {
    phonePrefix: "+34", phoneFormat: "XXX XXX XXX",
    states: [
      { name: "Madrid", cities: ["Madrid", "Alcalá de Henares", "Getafe"], zipPrefix: "28" },
      { name: "Catalonia", cities: ["Barcelona", "Tarragona", "Girona"], zipPrefix: "08" },
      { name: "Andalusia", cities: ["Seville", "Málaga", "Granada"], zipPrefix: "41" },
      { name: "Valencia", cities: ["Valencia", "Alicante"], zipPrefix: "46" },
    ],
  },
  "Sweden": {
    phonePrefix: "+46", phoneFormat: "XX-XXX XX XX",
    states: [
      { name: "Stockholm", cities: ["Stockholm", "Solna", "Sundbyberg"], zipPrefix: "1" },
      { name: "Västra Götaland", cities: ["Gothenburg"], zipPrefix: "4" },
      { name: "Skåne", cities: ["Malmö", "Lund"], zipPrefix: "2" },
    ],
  },
  "Switzerland": {
    phonePrefix: "+41", phoneFormat: "XX XXX XX XX",
    states: [
      { name: "Zurich", cities: ["Zurich", "Winterthur"], zipPrefix: "8" },
      { name: "Bern", cities: ["Bern", "Thun"], zipPrefix: "3" },
      { name: "Geneva", cities: ["Geneva"], zipPrefix: "1" },
    ],
  },
  "Taiwan": {
    phonePrefix: "+886", phoneFormat: "X XXXX XXXX",
    states: [
      { name: "Taipei", cities: ["Taipei", "Xinbei"], zipPrefix: "1" },
      { name: "Kaohsiung", cities: ["Kaohsiung"], zipPrefix: "8" },
      { name: "Taichung", cities: ["Taichung"], zipPrefix: "4" },
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
      { name: "Istanbul", cities: ["Istanbul", "Kadıköy", "Beşiktaş"], zipPrefix: "34" },
      { name: "Ankara", cities: ["Ankara"], zipPrefix: "06" },
      { name: "Izmir", cities: ["Izmir"], zipPrefix: "35" },
    ],
  },
  "Uganda": {
    phonePrefix: "+256", phoneFormat: "XXX XXXXXX",
    states: [{ name: "Central", cities: ["Kampala", "Entebbe"], zipPrefix: "" }],
  },
  "Ukraine": {
    phonePrefix: "+380", phoneFormat: "XX XXX XX XX",
    states: [
      { name: "Kyiv", cities: ["Kyiv"], zipPrefix: "01" },
      { name: "Kharkiv", cities: ["Kharkiv"], zipPrefix: "61" },
      { name: "Odesa", cities: ["Odesa"], zipPrefix: "65" },
    ],
  },
  "United Arab Emirates": {
    phonePrefix: "+971", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Dubai", cities: ["Dubai", "Deira", "Jumeirah"], zipPrefix: "" },
      { name: "Abu Dhabi", cities: ["Abu Dhabi", "Al Ain"], zipPrefix: "" },
      { name: "Sharjah", cities: ["Sharjah"], zipPrefix: "" },
    ],
  },
  "United Kingdom": {
    phonePrefix: "+44", phoneFormat: "XXXX XXXXXX",
    states: [
      { name: "England", cities: ["London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Bristol"], zipPrefix: "" },
      { name: "Scotland", cities: ["Edinburgh", "Glasgow", "Aberdeen", "Dundee"], zipPrefix: "" },
      { name: "Wales", cities: ["Cardiff", "Swansea", "Newport"], zipPrefix: "" },
      { name: "Northern Ireland", cities: ["Belfast", "Derry"], zipPrefix: "" },
    ],
  },
  "United States": {
    phonePrefix: "+1", phoneFormat: "(XXX) XXX-XXXX",
    states: [
      { name: "California", cities: ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose"], zipPrefix: "9" },
      { name: "New York", cities: ["New York City", "Buffalo", "Rochester", "Albany"], zipPrefix: "1" },
      { name: "Texas", cities: ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth"], zipPrefix: "7" },
      { name: "Florida", cities: ["Miami", "Orlando", "Tampa", "Jacksonville"], zipPrefix: "3" },
      { name: "Illinois", cities: ["Chicago", "Springfield", "Naperville", "Rockford"], zipPrefix: "6" },
      { name: "Pennsylvania", cities: ["Philadelphia", "Pittsburgh", "Allentown"], zipPrefix: "1" },
      { name: "Ohio", cities: ["Columbus", "Cleveland", "Cincinnati"], zipPrefix: "4" },
      { name: "Georgia", cities: ["Atlanta", "Augusta", "Savannah"], zipPrefix: "3" },
      { name: "Washington", cities: ["Seattle", "Tacoma", "Spokane", "Bellevue"], zipPrefix: "9" },
      { name: "Arizona", cities: ["Phoenix", "Tucson", "Mesa", "Scottsdale"], zipPrefix: "8" },
      { name: "Massachusetts", cities: ["Boston", "Cambridge", "Worcester"], zipPrefix: "0" },
      { name: "Michigan", cities: ["Detroit", "Grand Rapids", "Ann Arbor"], zipPrefix: "4" },
      { name: "Colorado", cities: ["Denver", "Colorado Springs", "Boulder"], zipPrefix: "8" },
    ],
  },
  "Cambodia": {
    phonePrefix: "+855", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Phnom Penh", cities: ["Phnom Penh"], zipPrefix: "12" },
      { name: "Siem Reap", cities: ["Siem Reap"], zipPrefix: "17" },
    ],
  },
  "Ghana": {
    phonePrefix: "+233", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Greater Accra", cities: ["Accra", "Tema"], zipPrefix: "GA" },
      { name: "Ashanti", cities: ["Kumasi"], zipPrefix: "AK" },
    ],
  },
  "Guatemala": {
    phonePrefix: "+502", phoneFormat: "XXXX XXXX",
    states: [
      { name: "Guatemala", cities: ["Guatemala City", "Mixco"], zipPrefix: "01" },
      { name: "Quetzaltenango", cities: ["Quetzaltenango"], zipPrefix: "09" },
    ],
  },
  "Honduras": {
    phonePrefix: "+504", phoneFormat: "XXXX-XXXX",
    states: [
      { name: "Francisco Morazán", cities: ["Tegucigalpa"], zipPrefix: "11" },
      { name: "Cortés", cities: ["San Pedro Sula"], zipPrefix: "21" },
    ],
  },
  "Iraq": {
    phonePrefix: "+964", phoneFormat: "XXX XXX XXXX",
    states: [
      { name: "Baghdad", cities: ["Baghdad"], zipPrefix: "10" },
      { name: "Erbil", cities: ["Erbil"], zipPrefix: "44" },
      { name: "Basra", cities: ["Basra"], zipPrefix: "61" },
    ],
  },
  "Jamaica": {
    phonePrefix: "+1", phoneFormat: "(XXX) XXX-XXXX",
    states: [
      { name: "Kingston", cities: ["Kingston", "Spanish Town"], zipPrefix: "KN" },
      { name: "Saint James", cities: ["Montego Bay"], zipPrefix: "MJ" },
    ],
  },
  "Kenya": {
    phonePrefix: "+254", phoneFormat: "XXX XXXXXX",
    states: [
      { name: "Nairobi", cities: ["Nairobi"], zipPrefix: "00" },
      { name: "Mombasa", cities: ["Mombasa"], zipPrefix: "80" },
      { name: "Kisumu", cities: ["Kisumu"], zipPrefix: "40" },
    ],
  },
  "Kuwait": {
    phonePrefix: "+965", phoneFormat: "XXXX XXXX",
    states: [
      { name: "Al Asimah", cities: ["Kuwait City"], zipPrefix: "1" },
      { name: "Hawalli", cities: ["Hawalli", "Salmiya"], zipPrefix: "3" },
    ],
  },
  "Laos": {
    phonePrefix: "+856", phoneFormat: "XX XX XXX XXX",
    states: [
      { name: "Vientiane", cities: ["Vientiane"], zipPrefix: "01" },
      { name: "Luang Prabang", cities: ["Luang Prabang"], zipPrefix: "06" },
    ],
  },
  "Lebanon": {
    phonePrefix: "+961", phoneFormat: "XX XXX XXX",
    states: [
      { name: "Beirut", cities: ["Beirut"], zipPrefix: "1" },
      { name: "Mount Lebanon", cities: ["Jounieh", "Byblos"], zipPrefix: "2" },
    ],
  },
  "Libya": {
    phonePrefix: "+218", phoneFormat: "XX-XXXXXXX",
    states: [
      { name: "Tripoli", cities: ["Tripoli"], zipPrefix: "" },
      { name: "Benghazi", cities: ["Benghazi"], zipPrefix: "" },
    ],
  },
  "Luxembourg": {
    phonePrefix: "+352", phoneFormat: "XXX XXX XXX",
    states: [{ name: "Luxembourg", cities: ["Luxembourg City", "Esch-sur-Alzette"], zipPrefix: "L-" }],
  },
  "Madagascar": {
    phonePrefix: "+261", phoneFormat: "XX XX XXX XX",
    states: [{ name: "Analamanga", cities: ["Antananarivo"], zipPrefix: "1" }],
  },
  "Malta": {
    phonePrefix: "+356", phoneFormat: "XXXX XXXX",
    states: [{ name: "Malta", cities: ["Valletta", "Sliema", "St. Julian's"], zipPrefix: "" }],
  },
  "Mongolia": {
    phonePrefix: "+976", phoneFormat: "XXXX XXXX",
    states: [
      { name: "Ulaanbaatar", cities: ["Ulaanbaatar"], zipPrefix: "14" },
      { name: "Darkhan-Uul", cities: ["Darkhan"], zipPrefix: "45" },
    ],
  },
  "Morocco": {
    phonePrefix: "+212", phoneFormat: "XXX-XXXXXX",
    states: [
      { name: "Casablanca-Settat", cities: ["Casablanca", "Mohammedia"], zipPrefix: "2" },
      { name: "Rabat-Salé-Kénitra", cities: ["Rabat", "Salé"], zipPrefix: "1" },
      { name: "Marrakech-Safi", cities: ["Marrakech"], zipPrefix: "4" },
    ],
  },
  "Mozambique": {
    phonePrefix: "+258", phoneFormat: "XX XXX XXXX",
    states: [{ name: "Maputo", cities: ["Maputo", "Matola"], zipPrefix: "" }],
  },
  "Myanmar": {
    phonePrefix: "+95", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Yangon", cities: ["Yangon"], zipPrefix: "11" },
      { name: "Mandalay", cities: ["Mandalay"], zipPrefix: "05" },
    ],
  },
  "Namibia": {
    phonePrefix: "+264", phoneFormat: "XX XXX XXXX",
    states: [{ name: "Khomas", cities: ["Windhoek"], zipPrefix: "90" }],
  },
  "Nicaragua": {
    phonePrefix: "+505", phoneFormat: "XXXX XXXX",
    states: [{ name: "Managua", cities: ["Managua"], zipPrefix: "1" }],
  },
  "North Macedonia": {
    phonePrefix: "+389", phoneFormat: "XX XXX XXX",
    states: [
      { name: "Skopje", cities: ["Skopje"], zipPrefix: "1" },
      { name: "Bitola", cities: ["Bitola"], zipPrefix: "7" },
    ],
  },
  "Oman": {
    phonePrefix: "+968", phoneFormat: "XXXX XXXX",
    states: [
      { name: "Muscat", cities: ["Muscat", "Seeb"], zipPrefix: "1" },
      { name: "Dhofar", cities: ["Salalah"], zipPrefix: "2" },
    ],
  },
  "Pakistan": {
    phonePrefix: "+92", phoneFormat: "XXX XXXXXXX",
    states: [
      { name: "Punjab", cities: ["Lahore", "Faisalabad", "Rawalpindi", "Multan"], zipPrefix: "5" },
      { name: "Sindh", cities: ["Karachi", "Hyderabad", "Sukkur"], zipPrefix: "7" },
      { name: "Islamabad", cities: ["Islamabad"], zipPrefix: "44" },
      { name: "Khyber Pakhtunkhwa", cities: ["Peshawar", "Abbottabad", "Mardan"], zipPrefix: "2" },
      { name: "Balochistan", cities: ["Quetta", "Gwadar"], zipPrefix: "8" },
    ],
  },
  "Palestine": {
    phonePrefix: "+970", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "West Bank", cities: ["Ramallah", "Nablus", "Hebron", "Bethlehem"], zipPrefix: "" },
      { name: "Gaza", cities: ["Gaza City", "Khan Yunis"], zipPrefix: "" },
    ],
  },
  "Panama": {
    phonePrefix: "+507", phoneFormat: "XXXX-XXXX",
    states: [{ name: "Panamá", cities: ["Panama City", "San Miguelito"], zipPrefix: "0" }],
  },
  "Paraguay": {
    phonePrefix: "+595", phoneFormat: "XXX XXXXXX",
    states: [
      { name: "Central", cities: ["Asunción", "San Lorenzo"], zipPrefix: "11" },
      { name: "Alto Paraná", cities: ["Ciudad del Este"], zipPrefix: "70" },
    ],
  },
  "Qatar": {
    phonePrefix: "+974", phoneFormat: "XXXX XXXX",
    states: [{ name: "Doha", cities: ["Doha", "Al Wakrah", "Al Rayyan"], zipPrefix: "" }],
  },
  "Rwanda": {
    phonePrefix: "+250", phoneFormat: "XXX XXX XXX",
    states: [{ name: "Kigali", cities: ["Kigali"], zipPrefix: "" }],
  },
  "El Salvador": {
    phonePrefix: "+503", phoneFormat: "XXXX XXXX",
    states: [{ name: "San Salvador", cities: ["San Salvador", "Santa Ana"], zipPrefix: "01" }],
  },
  "Senegal": {
    phonePrefix: "+221", phoneFormat: "XX XXX XX XX",
    states: [{ name: "Dakar", cities: ["Dakar", "Pikine"], zipPrefix: "" }],
  },
  "Somalia": {
    phonePrefix: "+252", phoneFormat: "XX XXXXXXX",
    states: [
      { name: "Banadir", cities: ["Mogadishu"], zipPrefix: "" },
      { name: "Woqooyi Galbeed", cities: ["Hargeisa"], zipPrefix: "" },
    ],
  },
  "Sri Lanka": {
    phonePrefix: "+94", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Western", cities: ["Colombo", "Dehiwala-Mount Lavinia"], zipPrefix: "1" },
      { name: "Central", cities: ["Kandy"], zipPrefix: "2" },
    ],
  },
  "Sudan": {
    phonePrefix: "+249", phoneFormat: "XX XXX XXXX",
    states: [{ name: "Khartoum", cities: ["Khartoum", "Omdurman"], zipPrefix: "1" }],
  },
  "Syria": {
    phonePrefix: "+963", phoneFormat: "XXX XXX XXXX",
    states: [
      { name: "Damascus", cities: ["Damascus"], zipPrefix: "" },
      { name: "Aleppo", cities: ["Aleppo"], zipPrefix: "" },
    ],
  },
  "Tanzania": {
    phonePrefix: "+255", phoneFormat: "XXX XXX XXX",
    states: [
      { name: "Dar es Salaam", cities: ["Dar es Salaam"], zipPrefix: "" },
      { name: "Dodoma", cities: ["Dodoma"], zipPrefix: "" },
    ],
  },
  "Trinidad and Tobago": {
    phonePrefix: "+1", phoneFormat: "(XXX) XXX-XXXX",
    states: [{ name: "Port of Spain", cities: ["Port of Spain", "San Fernando", "Chaguanas"], zipPrefix: "" }],
  },
  "Tunisia": {
    phonePrefix: "+216", phoneFormat: "XX XXX XXX",
    states: [
      { name: "Tunis", cities: ["Tunis"], zipPrefix: "1" },
      { name: "Sfax", cities: ["Sfax"], zipPrefix: "3" },
    ],
  },
  "Turkmenistan": {
    phonePrefix: "+993", phoneFormat: "XX XXXXXX",
    states: [{ name: "Ashgabat", cities: ["Ashgabat"], zipPrefix: "74" }],
  },
  "Uruguay": {
    phonePrefix: "+598", phoneFormat: "XX XXX XXX",
    states: [
      { name: "Montevideo", cities: ["Montevideo"], zipPrefix: "1" },
      { name: "Canelones", cities: ["Canelones", "Las Piedras"], zipPrefix: "9" },
    ],
  },
  "Uzbekistan": {
    phonePrefix: "+998", phoneFormat: "XX XXX XX XX",
    states: [
      { name: "Tashkent", cities: ["Tashkent"], zipPrefix: "10" },
      { name: "Samarkand", cities: ["Samarkand"], zipPrefix: "14" },
    ],
  },
  "Venezuela": {
    phonePrefix: "+58", phoneFormat: "XXX-XXXXXXX",
    states: [
      { name: "Caracas", cities: ["Caracas"], zipPrefix: "1" },
      { name: "Zulia", cities: ["Maracaibo"], zipPrefix: "4" },
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
  "Yemen": {
    phonePrefix: "+967", phoneFormat: "XXX XXX XXX",
    states: [
      { name: "Sana'a", cities: ["Sana'a"], zipPrefix: "" },
      { name: "Aden", cities: ["Aden"], zipPrefix: "" },
    ],
  },
  "Zambia": {
    phonePrefix: "+260", phoneFormat: "XX XXXXXXX",
    states: [{ name: "Lusaka", cities: ["Lusaka", "Kitwe"], zipPrefix: "1" }],
  },
  "Zimbabwe": {
    phonePrefix: "+263", phoneFormat: "XX XXX XXXX",
    states: [
      { name: "Harare", cities: ["Harare"], zipPrefix: "" },
      { name: "Bulawayo", cities: ["Bulawayo"], zipPrefix: "" },
    ],
  },
};
