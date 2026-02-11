"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.getById = exports.list = void 0;
const posts_service_1 = require("../services/posts.service");
const list = async (_req, res, next) => {
    try {
        const data = await posts_service_1.postsService.list();
        res.json(data);
    }
    catch (e) {
        next(e);
    }
};
exports.list = list;
const getById = async (req, res, next) => {
    try {
        const data = await posts_service_1.postsService.getById(Number(req.params.id));
        if (!data)
            return res.status(404).json({ message: 'Post not found' });
        res.json(data);
    }
    catch (e) {
        next(e);
    }
};
exports.getById = getById;
const create = async (req, res, next) => {
    try {
        const created = await posts_service_1.postsService.create(req.body);
        res.status(201).json(created);
    }
    catch (e) {
        next(e);
    }
};
exports.create = create;
const update = async (req, res, next) => {
    try {
        const updated = await posts_service_1.postsService.update(Number(req.params.id), req.body);
        res.json(updated);
    }
    catch (e) {
        next(e);
    }
};
exports.update = update;
const remove = async (req, res, next) => {
    try {
        await posts_service_1.postsService.remove(Number(req.params.id));
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
};
exports.remove = remove;
