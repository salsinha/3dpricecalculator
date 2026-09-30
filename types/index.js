/**
 * Tipos de referência do domínio. O projeto é JavaScript;
 * estes typedefs documentam os objetos usados entre serviços e UI.
 */

/**
 * @typedef {Object} Filament
 * @property {string} id
 * @property {string} brand
 * @property {string} material
 * @property {string} color
 * @property {number} rollPrice
 * @property {number} rollWeight
 * @property {number} pricePerKg
 * @property {string} createdAt
 */

/**
 * @typedef {Object} PieceFilament
 * @property {string} id
 * @property {string} filamentId
 * @property {number} grams
 * @property {number} pricePerKg
 * @property {string} brand
 * @property {string} material
 * @property {string} color
 */

/**
 * @typedef {Object} Piece
 * @property {string} id
 * @property {string} name
 * @property {string} printer
 * @property {number} printHours
 * @property {number} creationHours
 * @property {number} packagingCost
 * @property {string} createdAt
 * @property {PieceFilament[]} filaments
 */

/**
 * @typedef {Object} Settings
 * @property {string} id
 * @property {number} electricityPrice
 * @property {number} laborCost
 * @property {number} machineCost
 * @property {number} defaultMargin
 * @property {number} minimumPrice
 * @property {number} averagePower
 * @property {string} printerName
 */

/**
 * @typedef {Object} Printer
 * @property {string} id
 * @property {string} name
 * @property {number} averagePower
 * @property {number|null} machineCost
 * @property {boolean} isDefault
 */

export {};
