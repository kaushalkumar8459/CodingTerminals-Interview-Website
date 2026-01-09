"use strict";
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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminOnly = exports.SuperAdminOnly = exports.PermissionGuard = exports.RoleGuard = exports.RequireRole = exports.ROLES_KEY = void 0;
var common_1 = require("@nestjs/common");
var common_2 = require("@nestjs/common");
var core_1 = require("@nestjs/core");
var role_schema_1 = require("../../roles/schemas/role.schema");
exports.ROLES_KEY = 'roles';
var RequireRole = function () {
    var roles = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        roles[_i] = arguments[_i];
    }
    return function (target, propertyName, descriptor) {
        core_1.Reflector.createDecorator()(target, propertyName);
        Reflect.setMetadata(exports.ROLES_KEY, roles, descriptor.value);
    };
};
exports.RequireRole = RequireRole;
var RoleGuard = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var RoleGuard = _classThis = /** @class */ (function () {
        function RoleGuard_1(reflector) {
            this.reflector = reflector;
        }
        RoleGuard_1.prototype.canActivate = function (context) {
            var requiredRoles = this.reflector.getAllAndOverride(exports.ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
            if (!requiredRoles) {
                return true;
            }
            var user = context.switchToHttp().getRequest().user;
            return requiredRoles.some(function (role) { return (user === null || user === void 0 ? void 0 : user.role) === role; });
        };
        return RoleGuard_1;
    }());
    __setFunctionName(_classThis, "RoleGuard");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RoleGuard = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RoleGuard = _classThis;
}();
exports.RoleGuard = RoleGuard;
var PermissionGuard = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var PermissionGuard = _classThis = /** @class */ (function () {
        function PermissionGuard_1(reflector) {
            this.reflector = reflector;
        }
        PermissionGuard_1.prototype.canActivate = function (context) {
            var requiredPermissions = this.reflector.getAllAndOverride('permissions', [
                context.getHandler(),
                context.getClass(),
            ]);
            if (!requiredPermissions) {
                return true;
            }
            var user = context.switchToHttp().getRequest().user;
            if (!user) {
                throw new common_2.ForbiddenException('Access denied');
            }
            return true;
        };
        return PermissionGuard_1;
    }());
    __setFunctionName(_classThis, "PermissionGuard");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PermissionGuard = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PermissionGuard = _classThis;
}();
exports.PermissionGuard = PermissionGuard;
var SuperAdminOnly = function () {
    return function (target, propertyName, descriptor) {
        Reflect.setMetadata(exports.ROLES_KEY, [role_schema_1.RoleType.SUPER_ADMIN], descriptor.value);
    };
};
exports.SuperAdminOnly = SuperAdminOnly;
var AdminOnly = function () {
    return function (target, propertyName, descriptor) {
        Reflect.setMetadata(exports.ROLES_KEY, [role_schema_1.RoleType.SUPER_ADMIN, role_schema_1.RoleType.ADMIN], descriptor.value);
    };
};
exports.AdminOnly = AdminOnly;
