/**
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} code
 * @property {string} name
 * @property {string} [slug]
 * @property {string} [description]
 * @property {boolean} [active]
 */

/**
 * @typedef {Object} WatchSpecs
 * @property {string} movimiento
 * @property {string} material
 * @property {string} diametro
 * @property {string} resistenciaAgua
 * @property {string} garantia
 */

/**
 * @typedef {Object} Watch
 * @property {number} id
 * @property {string} name
 * @property {string} brand
 * @property {number} price
 * @property {string} categoryCode
 * @property {string} categoryName
 * @property {string} image
 * @property {string} description
 * @property {WatchSpecs} specs
 */

export {}
