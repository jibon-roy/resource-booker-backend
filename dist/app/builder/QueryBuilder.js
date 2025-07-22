"use strict";
// Query Builder in Prisma
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../errors/AppError"));
class QueryBuilder {
    constructor(model, query) {
        this.prismaQuery = {}; // Define as any for flexibility
        this.model = model;
        this.query = query;
    }
    // Search
    search(searchableFields) {
        const searchTerm = this.query.searchTerm;
        if (searchTerm) {
            this.prismaQuery.where = Object.assign(Object.assign({}, this.prismaQuery.where), { OR: searchableFields.map(field => ({
                    [field]: { contains: searchTerm, mode: 'insensitive' },
                })) });
        }
        return this;
    }
    // Filter
    filter() {
        const queryObj = Object.assign({}, this.query);
        const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
        excludeFields.forEach(field => delete queryObj[field]);
        const formattedFilters = {};
        for (const [key, value] of Object.entries(queryObj)) {
            if (typeof value === 'object' && value !== null) {
                let operatorFilter = {};
                for (const [operator, val] of Object.entries(value)) {
                    const numericValue = parseFloat(val);
                    if (isNaN(numericValue)) {
                        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `The value field in the ${operator} should be a number`);
                    }
                    operatorFilter[operator] = numericValue;
                }
                formattedFilters[key] = operatorFilter;
            }
            else {
                formattedFilters[key] = value;
            }
        }
        this.prismaQuery.where = Object.assign(Object.assign({}, this.prismaQuery.where), formattedFilters);
        return this;
    }
    // Sorting
    sort() {
        var _a;
        const sort = ((_a = this.query.sort) === null || _a === void 0 ? void 0 : _a.split(',')) || ['-createdAt'];
        const orderBy = sort.map(field => {
            if (field.startsWith('-')) {
                return { [field.slice(1)]: 'desc' };
            }
            return { [field]: 'asc' };
        });
        this.prismaQuery.orderBy = orderBy;
        return this;
    }
    // Pagination
    paginate() {
        const page = Number(this.query.page) || 1;
        const limit = Number(this.query.limit) || 10;
        const skip = (page - 1) * limit;
        this.prismaQuery.skip = skip;
        this.prismaQuery.take = limit;
        return this;
    }
    // Fields Selection
    fields() {
        var _a;
        const fields = ((_a = this.query.fields) === null || _a === void 0 ? void 0 : _a.split(',')) || [];
        if (fields.length > 0) {
            this.prismaQuery.select = fields.reduce((acc, field) => {
                if (field.startsWith('-')) {
                    acc[field.slice(1)] = false;
                }
                else {
                    acc[field] = true;
                }
                return acc;
            }, {});
        }
        return this;
    }
    // Execute Query
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.findMany(this.prismaQuery);
        });
    }
    // Count Total
    countTotal() {
        return __awaiter(this, void 0, void 0, function* () {
            const total = yield this.model.count({ where: this.prismaQuery.where });
            const page = Number(this.query.page) || 1;
            const limit = Number(this.query.limit) || 10;
            const totalPage = Math.ceil(total / limit);
            return {
                page,
                limit,
                total,
                totalPage,
            };
        });
    }
}
exports.default = QueryBuilder;
