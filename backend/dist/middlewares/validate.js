"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: 'Validation error', errors: result.error.flatten() });
    }
    // geçerse body'yi normalize edilmiş data ile değiştir
    req.body = result.data;
    next();
};
exports.validate = validate;
