import { parseNumber } from "@/lib/format";

function requiredText(value, label, errors, field, max = 80) {
  const text = String(value || "").trim();
  if (!text) {
    errors[field] = `Indique ${label}.`;
    return "";
  }
  if (text.length > max) {
    errors[field] = `Use no máximo ${max} caracteres.`;
  }
  return text;
}

function finiteNumber(value, errors, field, invalidMessage) {
  const number = parseNumber(value);
  if (!Number.isFinite(number)) {
    errors[field] = invalidMessage;
    return NaN;
  }
  return number;
}

export function validateFilament(input) {
  const errors = {};
  const brand = requiredText(input.brand, "a marca", errors, "brand");
  const material = requiredText(input.material, "o material", errors, "material");
  const color = requiredText(input.color, "a cor", errors, "color");
  const rollPrice = finiteNumber(
    input.rollPrice,
    errors,
    "rollPrice",
    "Indique um preço válido.",
  );
  const rollWeight = finiteNumber(
    input.rollWeight,
    errors,
    "rollWeight",
    "Indique um peso válido.",
  );

  if (Number.isFinite(rollPrice) && rollPrice < 0) {
    errors.rollPrice = "O preço do rolo não pode ser negativo.";
  }
  if (Number.isFinite(rollWeight) && rollWeight <= 0) {
    errors.rollWeight = "O peso do rolo tem de ser superior a zero.";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: { brand, material, color, rollPrice, rollWeight },
  };
}

export function validatePiece(input) {
  const errors = {};
  const name = requiredText(input.name, "o nome", errors, "name");
  const printer = requiredText(input.printer, "a impressora", errors, "printer");
  const creationHours = finiteNumber(
    input.creationHours,
    errors,
    "creationHours",
    "Indique um tempo de criação válido.",
  );
  const packagingCost = finiteNumber(
    input.packagingCost,
    errors,
    "packagingCost",
    "Indique um custo de embalagem válido.",
  );

  if (Number.isFinite(creationHours) && creationHours < 0) {
    errors.creationHours = "As horas de criação não podem ser negativas.";
  }
  if (Number.isFinite(packagingCost) && packagingCost < 0) {
    errors.packagingCost = "O custo de embalagem não pode ser negativo.";
  }

  const sourcePlates = Array.isArray(input.plates) ? input.plates : [];
  const plates = [];

  if (sourcePlates.length === 0) {
    errors.plates = "Adicione pelo menos uma plate.";
  }

  sourcePlates.forEach((plate, plateIndex) => {
    const plateErrors = {};
    const printHours = parseNumber(plate.printHours);
    const sourceLines = Array.isArray(plate.filaments) ? plate.filaments : [];
    const filaments = [];

    if (!Number.isFinite(printHours)) {
      plateErrors.printHours = "Indique um tempo de impressão válido.";
    } else if (printHours < 0) {
      plateErrors.printHours = "As horas de impressão não podem ser negativas.";
    }

    if (sourceLines.length === 0) {
      plateErrors.filaments = "Adicione pelo menos um filamento nesta plate.";
    }

    sourceLines.forEach((line, lineIndex) => {
      const lineErrors = {};
      const filamentId = String(line.filamentId || "").trim();
      const grams = parseNumber(line.grams);

      if (!filamentId) lineErrors.filamentId = "Selecione o filamento.";
      if (!Number.isFinite(grams)) lineErrors.grams = "Indique uma quantidade válida.";
      else if (grams <= 0) lineErrors.grams = "A quantidade tem de ser superior a zero.";
      else if (grams > 100000) lineErrors.grams = "A quantidade é demasiado alta.";

      if (Object.keys(lineErrors).length) {
        errors[`plate-${plateIndex}-line-${lineIndex}`] = lineErrors;
      } else {
        filaments.push({ filamentId, grams });
      }
    });

    if (Object.keys(plateErrors).length) {
      errors[`plate-${plateIndex}`] = plateErrors;
    }

    if (!plateErrors.printHours && !plateErrors.filaments && filaments.length === sourceLines.length) {
      plates.push({ printHours, filaments });
    }
  });

  const printHours = plates.reduce((sum, plate) => sum + plate.printHours, 0);

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: {
      name,
      printer,
      creationHours,
      packagingCost,
      printHours,
      plates,
      filaments: plates.flatMap((plate) => plate.filaments),
    },
  };
}

export function validateSettings(input) {
  const errors = {};
  const printerName = requiredText(
    input.printerName,
    "a impressora",
    errors,
    "printerName",
  );

  const fields = [
    ["laborCost", "Indique um custo de mão de obra válido.", "O custo de mão de obra não pode ser negativo.", 0],
    ["machineCost", "Indique um custo de máquina válido.", "O custo de máquina não pode ser negativo.", 0],
    ["minimumPrice", "Indique um preço mínimo válido.", "O preço mínimo não pode ser negativo.", 0],
    ["averagePower", "Indique um consumo válido.", "O consumo médio tem de ser superior a zero.", 0.000001],
  ];

  const value = { printerName };

  fields.forEach(([field, invalidMessage, negativeMessage, minimum]) => {
    const number = finiteNumber(input[field], errors, field, invalidMessage);
    if (Number.isFinite(number) && number < minimum) {
      errors[field] = negativeMessage;
    }
    value[field] = number;
  });

  const margin = finiteNumber(
    input.defaultMargin,
    errors,
    "defaultMargin",
    "Indique uma margem válida.",
  );
  if (Number.isFinite(margin) && (margin < 0 || margin >= 100)) {
    errors.defaultMargin = "A margem tem de ser igual ou superior a 0 e inferior a 100.";
  }
  value.defaultMargin = margin;

  return { ok: Object.keys(errors).length === 0, errors, value };
}

export function validatePrinter(input) {
  const errors = {};
  const name = requiredText(input.name, "o nome da impressora", errors, "name");
  const averagePower = finiteNumber(
    input.averagePower,
    errors,
    "averagePower",
    "Indique um consumo válido.",
  );
  const machineCost = finiteNumber(
    input.machineCost,
    errors,
    "machineCost",
    "Indique um custo de máquina válido.",
  );

  if (Number.isFinite(averagePower) && averagePower <= 0) {
    errors.averagePower = "O consumo médio tem de ser superior a zero.";
  }
  if (Number.isFinite(machineCost) && machineCost < 0) {
    errors.machineCost = "O custo de máquina não pode ser negativo.";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: { name, averagePower, machineCost },
  };
}

export function validateElectricityProfile(input) {
  const errors = {};
  const name = requiredText(input.name, "o nome do perfil", errors, "name");
  const pricePerKwh = finiteNumber(
    input.pricePerKwh,
    errors,
    "pricePerKwh",
    "Indique um preço de eletricidade válido.",
  );

  if (Number.isFinite(pricePerKwh) && pricePerKwh < 0) {
    errors.pricePerKwh = "O preço da eletricidade não pode ser negativo.";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: { name, pricePerKwh },
  };
}

export function validateLogin(input) {
  const errors = {};
  const email = String(input.email || "").trim();
  const password = String(input.password || "");

  if (!email) errors.email = "Indique o email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Indique um email válido.";
  }
  if (!password) errors.password = "Indique a palavra-passe.";

  return { ok: Object.keys(errors).length === 0, errors, value: { email, password } };
}
