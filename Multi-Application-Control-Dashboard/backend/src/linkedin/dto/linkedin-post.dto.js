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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLinkedInPostDto = exports.CreateLinkedInPostDto = void 0;
var class_validator_1 = require("class-validator");
var linkedin_post_schema_1 = require("../schemas/linkedin-post.schema");
var CreateLinkedInPostDto = function () {
    var _a;
    var _title_decorators;
    var _title_initializers = [];
    var _title_extraInitializers = [];
    var _content_decorators;
    var _content_initializers = [];
    var _content_extraInitializers = [];
    var _author_decorators;
    var _author_initializers = [];
    var _author_extraInitializers = [];
    var _imageUrl_decorators;
    var _imageUrl_initializers = [];
    var _imageUrl_extraInitializers = [];
    var _hashtags_decorators;
    var _hashtags_initializers = [];
    var _hashtags_extraInitializers = [];
    var _scheduledDate_decorators;
    var _scheduledDate_initializers = [];
    var _scheduledDate_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateLinkedInPostDto() {
                this.title = __runInitializers(this, _title_initializers, void 0);
                this.content = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _content_initializers, void 0));
                this.author = (__runInitializers(this, _content_extraInitializers), __runInitializers(this, _author_initializers, void 0));
                this.imageUrl = (__runInitializers(this, _author_extraInitializers), __runInitializers(this, _imageUrl_initializers, void 0));
                this.hashtags = (__runInitializers(this, _imageUrl_extraInitializers), __runInitializers(this, _hashtags_initializers, void 0));
                this.scheduledDate = (__runInitializers(this, _hashtags_extraInitializers), __runInitializers(this, _scheduledDate_initializers, void 0));
                __runInitializers(this, _scheduledDate_extraInitializers);
            }
            return CreateLinkedInPostDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _title_decorators = [(0, class_validator_1.IsString)()];
            _content_decorators = [(0, class_validator_1.IsString)()];
            _author_decorators = [(0, class_validator_1.IsString)()];
            _imageUrl_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _hashtags_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _scheduledDate_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDate)()];
            __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: function (obj) { return "title" in obj; }, get: function (obj) { return obj.title; }, set: function (obj, value) { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(null, null, _content_decorators, { kind: "field", name: "content", static: false, private: false, access: { has: function (obj) { return "content" in obj; }, get: function (obj) { return obj.content; }, set: function (obj, value) { obj.content = value; } }, metadata: _metadata }, _content_initializers, _content_extraInitializers);
            __esDecorate(null, null, _author_decorators, { kind: "field", name: "author", static: false, private: false, access: { has: function (obj) { return "author" in obj; }, get: function (obj) { return obj.author; }, set: function (obj, value) { obj.author = value; } }, metadata: _metadata }, _author_initializers, _author_extraInitializers);
            __esDecorate(null, null, _imageUrl_decorators, { kind: "field", name: "imageUrl", static: false, private: false, access: { has: function (obj) { return "imageUrl" in obj; }, get: function (obj) { return obj.imageUrl; }, set: function (obj, value) { obj.imageUrl = value; } }, metadata: _metadata }, _imageUrl_initializers, _imageUrl_extraInitializers);
            __esDecorate(null, null, _hashtags_decorators, { kind: "field", name: "hashtags", static: false, private: false, access: { has: function (obj) { return "hashtags" in obj; }, get: function (obj) { return obj.hashtags; }, set: function (obj, value) { obj.hashtags = value; } }, metadata: _metadata }, _hashtags_initializers, _hashtags_extraInitializers);
            __esDecorate(null, null, _scheduledDate_decorators, { kind: "field", name: "scheduledDate", static: false, private: false, access: { has: function (obj) { return "scheduledDate" in obj; }, get: function (obj) { return obj.scheduledDate; }, set: function (obj, value) { obj.scheduledDate = value; } }, metadata: _metadata }, _scheduledDate_initializers, _scheduledDate_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateLinkedInPostDto = CreateLinkedInPostDto;
var UpdateLinkedInPostDto = function () {
    var _a;
    var _title_decorators;
    var _title_initializers = [];
    var _title_extraInitializers = [];
    var _content_decorators;
    var _content_initializers = [];
    var _content_extraInitializers = [];
    var _imageUrl_decorators;
    var _imageUrl_initializers = [];
    var _imageUrl_extraInitializers = [];
    var _hashtags_decorators;
    var _hashtags_initializers = [];
    var _hashtags_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _scheduledDate_decorators;
    var _scheduledDate_initializers = [];
    var _scheduledDate_extraInitializers = [];
    return _a = /** @class */ (function () {
            function UpdateLinkedInPostDto() {
                this.title = __runInitializers(this, _title_initializers, void 0);
                this.content = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _content_initializers, void 0));
                this.imageUrl = (__runInitializers(this, _content_extraInitializers), __runInitializers(this, _imageUrl_initializers, void 0));
                this.hashtags = (__runInitializers(this, _imageUrl_extraInitializers), __runInitializers(this, _hashtags_initializers, void 0));
                this.status = (__runInitializers(this, _hashtags_extraInitializers), __runInitializers(this, _status_initializers, void 0));
                this.scheduledDate = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _scheduledDate_initializers, void 0));
                __runInitializers(this, _scheduledDate_extraInitializers);
            }
            return UpdateLinkedInPostDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _title_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _content_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _imageUrl_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _hashtags_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _status_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(linkedin_post_schema_1.PostStatus)];
            _scheduledDate_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDate)()];
            __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: function (obj) { return "title" in obj; }, get: function (obj) { return obj.title; }, set: function (obj, value) { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(null, null, _content_decorators, { kind: "field", name: "content", static: false, private: false, access: { has: function (obj) { return "content" in obj; }, get: function (obj) { return obj.content; }, set: function (obj, value) { obj.content = value; } }, metadata: _metadata }, _content_initializers, _content_extraInitializers);
            __esDecorate(null, null, _imageUrl_decorators, { kind: "field", name: "imageUrl", static: false, private: false, access: { has: function (obj) { return "imageUrl" in obj; }, get: function (obj) { return obj.imageUrl; }, set: function (obj, value) { obj.imageUrl = value; } }, metadata: _metadata }, _imageUrl_initializers, _imageUrl_extraInitializers);
            __esDecorate(null, null, _hashtags_decorators, { kind: "field", name: "hashtags", static: false, private: false, access: { has: function (obj) { return "hashtags" in obj; }, get: function (obj) { return obj.hashtags; }, set: function (obj, value) { obj.hashtags = value; } }, metadata: _metadata }, _hashtags_initializers, _hashtags_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _scheduledDate_decorators, { kind: "field", name: "scheduledDate", static: false, private: false, access: { has: function (obj) { return "scheduledDate" in obj; }, get: function (obj) { return obj.scheduledDate; }, set: function (obj, value) { obj.scheduledDate = value; } }, metadata: _metadata }, _scheduledDate_initializers, _scheduledDate_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UpdateLinkedInPostDto = UpdateLinkedInPostDto;
