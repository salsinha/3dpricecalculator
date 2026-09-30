export const APP_NAME = "3D J.A.";
export const APP_PRODUCT = "Price Calculator";
export const APP_TAGLINE = "Create & Print Studio";

export const DEFAULTS = {
  electricityPrice: 0.1499,
  laborCost: 5,
  machineCost: 0.4,
  defaultMargin: 25,
  minimumPrice: 3.5,
  averagePower: 0.08,
  printerName: "Bambu Lab A1 Mini",
};

export const EXAMPLE_FILAMENTS = [
  {
    brand: "Bambu Lab",
    material: "PLA",
    color: "Branco",
    rollPrice: 16.99,
    rollWeight: 1000,
  },
  {
    brand: "Bambu Lab",
    material: "PLA",
    color: "Preto",
    rollPrice: 16.99,
    rollWeight: 1000,
  },
  {
    brand: "Bambu Lab",
    material: "PLA",
    color: "Vermelho",
    rollPrice: 19.99,
    rollWeight: 1000,
  },
];

export const EXAMPLE_PIECE = {
  name: "Suporte de comandos",
  printer: "Bambu Lab A1 Mini",
  printHours: 5,
  creationHours: 0.75,
  packagingCost: 0.5,
  filaments: [
    { color: "Branco", grams: 80 },
    { color: "Vermelho", grams: 20 },
  ],
};
