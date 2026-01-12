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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogsController = void 0;
var common_1 = require("@nestjs/common");
var auth_guard_1 = require("../auth/guards/auth.guard");
var AuditLogsController = function () {
    var _classDecorators = [(0, common_1.Controller)('audit-logs'), (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _findAll_decorators;
    var _getStats_decorators;
    var _findByUser_decorators;
    var _findByModule_decorators;
    var _findByAction_decorators;
    var _getActivityByDate_decorators;
    var AuditLogsController = _classThis = /** @class */ (function () {
        function AuditLogsController_1(auditLogsService) {
            this.auditLogsService = (__runInitializers(this, _instanceExtraInitializers), auditLogsService);
        }
        AuditLogsController_1.prototype.findAll = function () {
            return this.auditLogsService.findAll();
        };
        AuditLogsController_1.prototype.getStats = function () {
            return this.auditLogsService.getStats();
        };
        AuditLogsController_1.prototype.findByUser = function (userId) {
            return this.auditLogsService.findByUserId(userId);
        };
        AuditLogsController_1.prototype.findByModule = function (module) {
            return this.auditLogsService.findByModule(module);
        };
        AuditLogsController_1.prototype.findByAction = function (action) {
            return this.auditLogsService.findByAction(action);
        };
        AuditLogsController_1.prototype.getActivityByDate = function (startDate, endDate) {
            return this.auditLogsService.getActivityByDate(new Date(startDate), new Date(endDate));
        };
        return AuditLogsController_1;
    }());
    __setFunctionName(_classThis, "AuditLogsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _findAll_decorators = [(0, common_1.Get)()];
        _getStats_decorators = [(0, common_1.Get)('stats')];
        _findByUser_decorators = [(0, common_1.Get)('user/:userId')];
        _findByModule_decorators = [(0, common_1.Get)('module/:module')];
        _findByAction_decorators = [(0, common_1.Get)('action/:action')];
        _getActivityByDate_decorators = [(0, common_1.Get)('range')];
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: function (obj) { return "findAll" in obj; }, get: function (obj) { return obj.findAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: function (obj) { return "getStats" in obj; }, get: function (obj) { return obj.getStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findByUser_decorators, { kind: "method", name: "findByUser", static: false, private: false, access: { has: function (obj) { return "findByUser" in obj; }, get: function (obj) { return obj.findByUser; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findByModule_decorators, { kind: "method", name: "findByModule", static: false, private: false, access: { has: function (obj) { return "findByModule" in obj; }, get: function (obj) { return obj.findByModule; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findByAction_decorators, { kind: "method", name: "findByAction", static: false, private: false, access: { has: function (obj) { return "findByAction" in obj; }, get: function (obj) { return obj.findByAction; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getActivityByDate_decorators, { kind: "method", name: "getActivityByDate", static: false, private: false, access: { has: function (obj) { return "getActivityByDate" in obj; }, get: function (obj) { return obj.getActivityByDate; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuditLogsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuditLogsController = _classThis;
}();
exports.AuditLogsController = AuditLogsController;
