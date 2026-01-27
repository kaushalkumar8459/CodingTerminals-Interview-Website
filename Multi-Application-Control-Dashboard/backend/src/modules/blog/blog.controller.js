"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
var role_guard_1 = require("../../auth/guards/role.guard");
var roles_decorator_1 = require("../../auth/decorators/roles.decorator");
var BlogController = function () {
    var _classDecorators = [(0, common_1.Controller)('api/blog'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, role_guard_1.RoleGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getAllPosts_decorators;
    var _getPostById_decorators;
    var _createPost_decorators;
    var _updatePost_decorators;
    var _deletePost_decorators;
    var _publishPost_decorators;
    var _unpublishPost_decorators;
    var BlogController = _classThis = /** @class */ (function () {
        function BlogController_1(blogService) {
            this.blogService = (__runInitializers(this, _instanceExtraInitializers), blogService);
        }
        BlogController_1.prototype.getAllPosts = function (user, status) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.blogService.getAllPosts(user, status)];
                });
            });
        };
        BlogController_1.prototype.getPostById = function (id, user) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.blogService.getPostById(id, user)];
                });
            });
        };
        BlogController_1.prototype.createPost = function (dto, user) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.blogService.createPost(dto, user)];
                });
            });
        };
        BlogController_1.prototype.updatePost = function (id, dto, user) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.blogService.updatePost(id, dto, user)];
                });
            });
        };
        BlogController_1.prototype.deletePost = function (id, user) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.blogService.deletePost(id, user)];
                });
            });
        };
        BlogController_1.prototype.publishPost = function (id, user) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.blogService.publishPost(id, user)];
                });
            });
        };
        BlogController_1.prototype.unpublishPost = function (id, user) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.blogService.unpublishPost(id, user)];
                });
            });
        };
        return BlogController_1;
    }());
    __setFunctionName(_classThis, "BlogController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getAllPosts_decorators = [(0, common_1.Get)(), (0, roles_decorator_1.Roles)(['SUPER_ADMIN', 'ADMIN', 'VIEWER'])];
        _getPostById_decorators = [(0, common_1.Get)(':id'), (0, roles_decorator_1.Roles)(['SUPER_ADMIN', 'ADMIN', 'VIEWER'])];
        _createPost_decorators = [(0, common_1.Post)(), (0, roles_decorator_1.Roles)(['SUPER_ADMIN', 'ADMIN']), (0, common_1.HttpCode)(common_1.HttpStatus.CREATED)];
        _updatePost_decorators = [(0, common_1.Put)(':id'), (0, roles_decorator_1.Roles)(['SUPER_ADMIN', 'ADMIN'])];
        _deletePost_decorators = [(0, common_1.Delete)(':id'), (0, roles_decorator_1.Roles)(['SUPER_ADMIN', 'ADMIN']), (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT)];
        _publishPost_decorators = [(0, common_1.Put)(':id/publish'), (0, roles_decorator_1.Roles)(['SUPER_ADMIN', 'ADMIN'])];
        _unpublishPost_decorators = [(0, common_1.Put)(':id/unpublish'), (0, roles_decorator_1.Roles)(['SUPER_ADMIN', 'ADMIN'])];
        __esDecorate(_classThis, null, _getAllPosts_decorators, { kind: "method", name: "getAllPosts", static: false, private: false, access: { has: function (obj) { return "getAllPosts" in obj; }, get: function (obj) { return obj.getAllPosts; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPostById_decorators, { kind: "method", name: "getPostById", static: false, private: false, access: { has: function (obj) { return "getPostById" in obj; }, get: function (obj) { return obj.getPostById; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createPost_decorators, { kind: "method", name: "createPost", static: false, private: false, access: { has: function (obj) { return "createPost" in obj; }, get: function (obj) { return obj.createPost; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updatePost_decorators, { kind: "method", name: "updatePost", static: false, private: false, access: { has: function (obj) { return "updatePost" in obj; }, get: function (obj) { return obj.updatePost; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deletePost_decorators, { kind: "method", name: "deletePost", static: false, private: false, access: { has: function (obj) { return "deletePost" in obj; }, get: function (obj) { return obj.deletePost; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _publishPost_decorators, { kind: "method", name: "publishPost", static: false, private: false, access: { has: function (obj) { return "publishPost" in obj; }, get: function (obj) { return obj.publishPost; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _unpublishPost_decorators, { kind: "method", name: "unpublishPost", static: false, private: false, access: { has: function (obj) { return "unpublishPost" in obj; }, get: function (obj) { return obj.unpublishPost; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BlogController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BlogController = _classThis;
}();
exports.BlogController = BlogController;
