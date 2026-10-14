export const STATES = [
  "Puducherry","Haryana","Arunachal Pradesh","Bihar","Assam","Jharkhand","Gujarat","Tripura",
  "Multiple States","Chhattisgarh","Sikkim","Nagaland","Mizoram","Kashmir","Goa","Chandigarh",
  "Delhi","Kerala","Dadra and Nagar Haveli","Andaman and Nicobar Islands","Manipur","Uttarakhand",
  "Orissa","Uttar Pradesh","Andhra Pradesh","Lakshadweep","West Bengal","Jammu and Kashmir",
  "Karnataka","Telangana","Rajasthan","Himachal Pradesh","Meghalaya","Uttaranchal","Odisha",
  "Madhya Pradesh","Maharashtra","Punjab","Daman and Diu","Devbhoomi Dwarka","Tamil Nadu",
];

export const SEGMENTS = [
  "Agrochemicals / Pesticides","Airports","Auto Components / Ancillaries","Beverages","Cement","Coal",
  "Cold Storage / Warehousing","Defence / Aerospace","Distillery / Ethanol","Effluent Treatment / CETP",
  "Electric Vehicles & Battery Manufacturing","Electronics, Semiconductors & Data Centers","Ferro Alloys",
  "Fertilizers","Food Processing Projects","Glass / Ceramics","Green Fuels & New Energy Projects",
  "Highways / Roads","Hospitals / Healthcare","Hotels / Hospitality","Logistics Park / Industrial Park",
  "Medical Devices & Biologics","Non-Ferrous Metals Projects","Oil & Gas / Refinery","Other Chemicals",
  "Other Manufacturing","Packaging / Plastics","Paper Products","Petrochemicals","Pharmaceuticals Projects",
  "Ports / Shipping","Railways / Metro","Renewable Power Projects","Specialty Chemicals","Steel Projects",
  "Synthetic Organic Chemicals","Textiles / Yarn","Thermal Power & Grid Infrastructure Projects",
  "Tyres / Rubber","Unclassified","Vehicle Assembly","Water Supply & Irrigation Projects",
];

export const INDUSTRIES = [
  "Automotive Industries","Building Materials","Chemicals","Distillery","Environment","Equipment",
  "Food Processing","Hospitality and Healthcare","Infrastructure","Manufacturing","Metallurgical Industries",
  "Mining","Miscellaneous","NA","Petroleum","Power Generation","Research and Development","Textiles",
  "Transport","Water & Sanitation",
];

export const REGIONS = ["Central", "Eastern", "Northern", "Southern", "West"];

export const YEARS = Array.from({ length: 15 }, (_, i) => String(new Date().getFullYear() - i));

// Combined ProductOption object mapped to state keys used by AllProduct.jsx
export const ProductOption = {
  state: STATES,
  region: REGIONS,
  segment: SEGMENTS,
  industry: INDUSTRIES,
  year: YEARS,
};

export default ProductOption;