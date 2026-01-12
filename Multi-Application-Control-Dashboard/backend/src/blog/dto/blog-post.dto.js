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
exports.UpdateBlogPostDto = exports.CreateBlogPostDto = void 0;
var class_validator_1 = require("class-validator");
var blog_post_schema_1 = require("../schemas/blog-post.schema");
var CreateBlogPostDto = function () {
    var _a;
    var _title_decorators;
    var _title_initializers = [];
    var _title_extraInitializers = [];
    var _content_decorators;
    var _content_initializers = [];
    var _content_extraInitializers = [];
    var _excerpt_decorators;
    var _excerpt_initializers = [];
    var _excerpt_extraInitializers = [];
    var _author_decorators;
    var _author_initializers = [];
    var _author_extraInitializers = [];
    var _tags_decorators;
    var _tags_initializers = [];
    var _tags_extraInitializers = [];
    var _featuredImage_decorators;
    var _featuredImage_initializers = [];
    var _featuredImage_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateBlogPostDto() {
                this.title = __runInitializers(this, _title_initializers, void 0);
                this.content = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _content_initializers, void 0));
                this.excerpt = (__runInitializers(this, _content_extraInitializers), __runInitializers(this, _excerpt_initializers, void 0));
                this.author = (__runInitializers(this, _excerpt_extraInitializers), __runInitializers(this, _author_initializers, void 0));
                this.tags = (__runInitializers(this, _author_extraInitializers), __runInitializers(this, _tags_initializers, void 0));
                this.featuredImage = (__runInitializers(this, _tags_extraInitializers), __runInitializers(this, _featuredImage_initializers, void 0));
                __runInitializers(this, _featuredImage_extraInitializers);
            }
            return CreateBlogPostDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _title_decorators = [(0, class_validator_1.IsString)()];
            _content_decorators = [(0, class_validator_1.IsString)()];
            _excerpt_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _author_decorators = [(0, class_validator_1.IsString)()];
            _tags_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _featuredImage_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: function (obj) { return "title" in obj; }, get: function (obj) { return obj.title; }, set: function (obj, value) { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(null, null, _content_decorators, { kind: "field", name: "content", static: false, private: false, access: { has: function (obj) { return "content" in obj; }, get: function (obj) { return obj.content; }, set: function (obj, value) { obj.content = value; } }, metadata: _metadata }, _content_initializers, _content_extraInitializers);
            __esDecorate(null, null, _excerpt_decorators, { kind: "field", name: "excerpt", static: false, private: false, access: { has: function (obj) { return "excerpt" in obj; }, get: function (obj) { return obj.excerpt; }, set: function (obj, value) { obj.excerpt = value; } }, metadata: _metadata }, _excerpt_initializers, _excerpt_extraInitializers);
            __esDecorate(null, null, _author_decorators, { kind: "field", name: "author", static: false, private: false, access: { has: function (obj) { return "author" in obj; }, get: function (obj) { return obj.author; }, set: function (obj, value) { obj.author = value; } }, metadata: _metadata }, _author_initializers, _author_extraInitializers);
            __esDecorate(null, null, _tags_decorators, { kind: "field", name: "tags", static: false, private: false, access: { has: function (obj) { return "tags" in obj; }, get: function (obj) { return obj.tags; }, set: function (obj, value) { obj.tags = value; } }, metadata: _metadata }, _tags_initializers, _tags_extraInitializers);
            __esDecorate(null, null, _featuredImage_decorators, { kind: "field", name: "featuredImage", static: false, private: false, access: { has: function (obj) { return "featuredImage" in obj; }, get: function (obj) { return obj.featuredImage; }, set: function (obj, value) { obj.featuredImage = value; } }, metadata: _metadata }, _featuredImage_initializers, _featuredImage_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateBlogPostDto = CreateBlogPostDto;
var UpdateBlogPostDto = function () {
    var _a;
    var _title_decorators;
    var _title_initializers = [];
    var _title_extraInitializers = [];
    var _content_decorators;
    var _content_initializers = [];
    var _content_extraInitializers = [];
    var _excerpt_decorators;
    var _excerpt_initializers = [];
    var _excerpt_extraInitializers = [];
    var _tags_decorators;
    var _tags_initializers = [];
    var _tags_extraInitializers = [];
    var _featuredImage_decorators;
    var _featuredImage_initializers = [];
    var _featuredImage_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    return _a = /** @class */ (function () {
            function UpdateBlogPostDto() {
                this.title = __runInitializers(this, _title_initializers, void 0);
                this.content = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _content_initializers, void 0));
                this.excerpt = (__runInitializers(this, _content_extraInitializers), __runInitializers(this, _excerpt_initializers, void 0));
                this.tags = (__runInitializers(this, _excerpt_extraInitializers), __runInitializers(this, _tags_initializers, void 0));
                this.featuredImage = (__runInitializers(this, _tags_extraInitializers), __runInitializers(this, _featuredImage_initializers, void 0));
                this.status = (__runInitializers(this, _featuredImage_extraInitializers), __runInitializers(this, _status_initializers, void 0));
                __runInitializers(this, _status_extraInitializers);
            }
            return UpdateBlogPostDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _title_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _content_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _excerpt_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _tags_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _featuredImage_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _status_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(blog_post_schema_1.BlogPostStatus)];
            __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: function (obj) { return "title" in obj; }, get: function (obj) { return obj.title; }, set: function (obj, value) { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(null, null, _content_decorators, { kind: "field", name: "content", static: false, private: false, access: { has: function (obj) { return "content" in obj; }, get: function (obj) { return obj.content; }, set: function (obj, value) { obj.content = value; } }, metadata: _metadata }, _content_initializers, _content_extraInitializers);
            __esDecorate(null, null, _excerpt_decorators, { kind: "field", name: "excerpt", static: false, private: false, access: { has: function (obj) { return "excerpt" in obj; }, get: function (obj) { return obj.excerpt; }, set: function (obj, value) { obj.excerpt = value; } }, metadata: _metadata }, _excerpt_initializers, _excerpt_extraInitializers);
            __esDecorate(null, null, _tags_decorators, { kind: "field", name: "tags", static: false, private: false, access: { has: function (obj) { return "tags" in obj; }, get: function (obj) { return obj.tags; }, set: function (obj, value) { obj.tags = value; } }, metadata: _metadata }, _tags_initializers, _tags_extraInitializers);
            __esDecorate(null, null, _featuredImage_decorators, { kind: "field", name: "featuredImage", static: false, private: false, access: { has: function (obj) { return "featuredImage" in obj; }, get: function (obj) { return obj.featuredImage; }, set: function (obj, value) { obj.featuredImage = value; } }, metadata: _metadata }, _featuredImage_initializers, _featuredImage_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UpdateBlogPostDto = UpdateBlogPostDto;
