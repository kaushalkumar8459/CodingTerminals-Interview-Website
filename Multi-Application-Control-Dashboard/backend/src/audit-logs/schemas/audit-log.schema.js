"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.AuditLogSchema = exports.AuditLog = void 0;
var mongoose_1 = require("@nestjs/mongoose");
var mongoose_2 = require("mongoose");
var AuditLog = function () {
    var _classDecorators = [(0, mongoose_1.Schema)({ timestamps: true })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = mongoose_2.Document;
    var _userId_decorators;
    var _userId_initializers = [];
    var _userId_extraInitializers = [];
    var _action_decorators;
    var _action_initializers = [];
    var _action_extraInitializers = [];
    var _resource_decorators;
    var _resource_initializers = [];
    var _resource_extraInitializers = [];
    var _resourceId_decorators;
    var _resourceId_initializers = [];
    var _resourceId_extraInitializers = [];
    var _changes_decorators;
    var _changes_initializers = [];
    var _changes_extraInitializers = [];
    var _ipAddress_decorators;
    var _ipAddress_initializers = [];
    var _ipAddress_extraInitializers = [];
    var _userAgent_decorators;
    var _userAgent_initializers = [];
    var _userAgent_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var AuditLog = _classThis = /** @class */ (function (_super) {
        __extends(AuditLog_1, _super);
        function AuditLog_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.userId = __runInitializers(_this, _userId_initializers, void 0);
            _this.action = (__runInitializers(_this, _userId_extraInitializers), __runInitializers(_this, _action_initializers, void 0));
            _this.resource = (__runInitializers(_this, _action_extraInitializers), __runInitializers(_this, _resource_initializers, void 0));
            _this.resourceId = (__runInitializers(_this, _resource_extraInitializers), __runInitializers(_this, _resourceId_initializers, void 0));
            _this.changes = (__runInitializers(_this, _resourceId_extraInitializers), __runInitializers(_this, _changes_initializers, void 0));
            _this.ipAddress = (__runInitializers(_this, _changes_extraInitializers), __runInitializers(_this, _ipAddress_initializers, void 0));
            _this.userAgent = (__runInitializers(_this, _ipAddress_extraInitializers), __runInitializers(_this, _userAgent_initializers, void 0));
            _this.status = (__runInitializers(_this, _userAgent_extraInitializers), __runInitializers(_this, _status_initializers, void 0));
            __runInitializers(_this, _status_extraInitializers);
            return _this;
        }
        return AuditLog_1;
    }(_classSuper));
    __setFunctionName(_classThis, "AuditLog");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _userId_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true })];
        _action_decorators = [(0, mongoose_1.Prop)({ required: true })];
        _resource_decorators = [(0, mongoose_1.Prop)({ required: true })];
        _resourceId_decorators = [(0, mongoose_1.Prop)()];
        _changes_decorators = [(0, mongoose_1.Prop)({ type: Object })];
        _ipAddress_decorators = [(0, mongoose_1.Prop)()];
        _userAgent_decorators = [(0, mongoose_1.Prop)()];
        _status_decorators = [(0, mongoose_1.Prop)({ enum: ['success', 'failure'], default: 'success' })];
        __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: function (obj) { return "userId" in obj; }, get: function (obj) { return obj.userId; }, set: function (obj, value) { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
        __esDecorate(null, null, _action_decorators, { kind: "field", name: "action", static: false, private: false, access: { has: function (obj) { return "action" in obj; }, get: function (obj) { return obj.action; }, set: function (obj, value) { obj.action = value; } }, metadata: _metadata }, _action_initializers, _action_extraInitializers);
        __esDecorate(null, null, _resource_decorators, { kind: "field", name: "resource", static: false, private: false, access: { has: function (obj) { return "resource" in obj; }, get: function (obj) { return obj.resource; }, set: function (obj, value) { obj.resource = value; } }, metadata: _metadata }, _resource_initializers, _resource_extraInitializers);
        __esDecorate(null, null, _resourceId_decorators, { kind: "field", name: "resourceId", static: false, private: false, access: { has: function (obj) { return "resourceId" in obj; }, get: function (obj) { return obj.resourceId; }, set: function (obj, value) { obj.resourceId = value; } }, metadata: _metadata }, _resourceId_initializers, _resourceId_extraInitializers);
        __esDecorate(null, null, _changes_decorators, { kind: "field", name: "changes", static: false, private: false, access: { has: function (obj) { return "changes" in obj; }, get: function (obj) { return obj.changes; }, set: function (obj, value) { obj.changes = value; } }, metadata: _metadata }, _changes_initializers, _changes_extraInitializers);
        __esDecorate(null, null, _ipAddress_decorators, { kind: "field", name: "ipAddress", static: false, private: false, access: { has: function (obj) { return "ipAddress" in obj; }, get: function (obj) { return obj.ipAddress; }, set: function (obj, value) { obj.ipAddress = value; } }, metadata: _metadata }, _ipAddress_initializers, _ipAddress_extraInitializers);
        __esDecorate(null, null, _userAgent_decorators, { kind: "field", name: "userAgent", static: false, private: false, access: { has: function (obj) { return "userAgent" in obj; }, get: function (obj) { return obj.userAgent; }, set: function (obj, value) { obj.userAgent = value; } }, metadata: _metadata }, _userAgent_initializers, _userAgent_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuditLog = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuditLog = _classThis;
}();
exports.AuditLog = AuditLog;
exports.AuditLogSchema = mongoose_1.SchemaFactory.createForClass(AuditLog);
