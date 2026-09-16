function validateCustomer(customer) {
  if (!customer) throw badRequest("Missing delivery details.");
  const required = ["name", "phone", "address", "city", "state", "pin"];
  for (const field of required) {
    if (!customer[field] || String(customer[field]).trim().length < 2) {
      throw badRequest(`Missing or invalid ${field}.`);
    }
  }
  if (!/^[6-9]\d{9}$/.test(String(customer.phone).trim())) {
    throw badRequest("Invalid phone number.");
  }
  if (!/^\d{6}$/.test(String(customer.pin).trim())) {
    throw badRequest("Invalid PIN code.");
  }
  if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(customer.email).trim())) {
    throw badRequest("Invalid email address.");
  }
}

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

module.exports = { validateCustomer, badRequest };
