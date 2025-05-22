// utils/objectUtils.js
export function omitId(obj) {
  const { id, ...rest } = obj;
  return rest;
}

export function omitFields(obj, fieldsToOmit = []) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !fieldsToOmit.includes(key))
  );
}

// module.exports = { omitId, omitFields };
