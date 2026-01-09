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
exports.LinkedInPostSchema = exports.LinkedInPost = exports.PostStatus = void 0;
var mongoose_1 = require("@nestjs/mongoose");
var mongoose_2 = require("mongoose");
var PostStatus;
(function (PostStatus) {
    PostStatus["DRAFT"] = "draft";
    PostStatus["SCHEDULED"] = "scheduled";
    PostStatus["PUBLISHED"] = "published";
    PostStatus["ARCHIVED"] = "archived";
})(PostStatus || (exports.PostStatus = PostStatus = {}));
var LinkedInPost = function () {
    var _classDecorators = [(0, mongoose_1.Schema)({ timestamps: true })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = mongoose_2.Document;
    var _title_decorators;
    var _title_initializers = [];
    var _title_extraInitializers = [];
    var _content_decorators;
    var _content_initializers = [];
    var _content_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _author_decorators;
    var _author_initializers = [];
    var _author_extraInitializers = [];
    var _scheduledDate_decorators;
    var _scheduledDate_initializers = [];
    var _scheduledDate_extraInitializers = [];
    var _likes_decorators;
    var _likes_initializers = [];
    var _likes_extraInitializers = [];
    var _comments_decorators;
    var _comments_initializers = [];
    var _comments_extraInitializers = [];
    var _shares_decorators;
    var _shares_initializers = [];
    var _shares_extraInitializers = [];
    var _imageUrl_decorators;
    var _imageUrl_initializers = [];
    var _imageUrl_extraInitializers = [];
    var _published_decorators;
    var _published_initializers = [];
    var _published_extraInitializers = [];
    var _publishedDate_decorators;
    var _publishedDate_initializers = [];
    var _publishedDate_extraInitializers = [];
    var _views_decorators;
    var _views_initializers = [];
    var _views_extraInitializers = [];
    var _hashtags_decorators;
    var _hashtags_initializers = [];
    var _hashtags_extraInitializers = [];
    var _linkedInPostId_decorators;
    var _linkedInPostId_initializers = [];
    var _linkedInPostId_extraInitializers = [];
    var _createdBy_decorators;
    var _createdBy_initializers = [];
    var _createdBy_extraInitializers = [];
    var _updatedBy_decorators;
    var _updatedBy_initializers = [];
    var _updatedBy_extraInitializers = [];
    var _analytics_decorators;
    var _analytics_initializers = [];
    var _analytics_extraInitializers = [];
    var _metadata_decorators;
    var _metadata_initializers = [];
    var _metadata_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var LinkedInPost = _classThis = /** @class */ (function (_super) {
        __extends(LinkedInPost_1, _super);
        function LinkedInPost_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.title = __runInitializers(_this, _title_initializers, void 0);
            _this.content = (__runInitializers(_this, _title_extraInitializers), __runInitializers(_this, _content_initializers, void 0));
            _this.status = (__runInitializers(_this, _content_extraInitializers), __runInitializers(_this, _status_initializers, void 0));
            _this.author = (__runInitializers(_this, _status_extraInitializers), __runInitializers(_this, _author_initializers, void 0));
            _this.scheduledDate = (__runInitializers(_this, _author_extraInitializers), __runInitializers(_this, _scheduledDate_initializers, void 0));
            _this.likes = (__runInitializers(_this, _scheduledDate_extraInitializers), __runInitializers(_this, _likes_initializers, void 0));
            _this.comments = (__runInitializers(_this, _likes_extraInitializers), __runInitializers(_this, _comments_initializers, void 0));
            _this.shares = (__runInitializers(_this, _comments_extraInitializers), __runInitializers(_this, _shares_initializers, void 0));
            _this.imageUrl = (__runInitializers(_this, _shares_extraInitializers), __runInitializers(_this, _imageUrl_initializers, void 0));
            _this.published = (__runInitializers(_this, _imageUrl_extraInitializers), __runInitializers(_this, _published_initializers, void 0));
            _this.publishedDate = (__runInitializers(_this, _published_extraInitializers), __runInitializers(_this, _publishedDate_initializers, void 0));
            _this.views = (__runInitializers(_this, _publishedDate_extraInitializers), __runInitializers(_this, _views_initializers, void 0));
            _this.hashtags = (__runInitializers(_this, _views_extraInitializers), __runInitializers(_this, _hashtags_initializers, void 0));
            _this.linkedInPostId = (__runInitializers(_this, _hashtags_extraInitializers), __runInitializers(_this, _linkedInPostId_initializers, void 0));
            _this.createdBy = (__runInitializers(_this, _linkedInPostId_extraInitializers), __runInitializers(_this, _createdBy_initializers, void 0)); // User ID
            _this.updatedBy = (__runInitializers(_this, _createdBy_extraInitializers), __runInitializers(_this, _updatedBy_initializers, void 0));
            _this.analytics = (__runInitializers(_this, _updatedBy_extraInitializers), __runInitializers(_this, _analytics_initializers, void 0));
            _this.metadata = (__runInitializers(_this, _analytics_extraInitializers), __runInitializers(_this, _metadata_initializers, void 0));
            _this.createdAt = (__runInitializers(_this, _metadata_extraInitializers), __runInitializers(_this, _createdAt_initializers, void 0));
            _this.updatedAt = (__runInitializers(_this, _createdAt_extraInitializers), __runInitializers(_this, _updatedAt_initializers, void 0));
            __runInitializers(_this, _updatedAt_extraInitializers);
            return _this;
        }
        return LinkedInPost_1;
    }(_classSuper));
    __setFunctionName(_classThis, "LinkedInPost");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _title_decorators = [(0, mongoose_1.Prop)({ required: true })];
        _content_decorators = [(0, mongoose_1.Prop)({ required: true })];
        _status_decorators = [(0, mongoose_1.Prop)({ type: String, enum: PostStatus, default: PostStatus.DRAFT })];
        _author_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true })];
        _scheduledDate_decorators = [(0, mongoose_1.Prop)()];
        _likes_decorators = [(0, mongoose_1.Prop)({ default: 0 })];
        _comments_decorators = [(0, mongoose_1.Prop)({ default: 0 })];
        _shares_decorators = [(0, mongoose_1.Prop)({ default: 0 })];
        _imageUrl_decorators = [(0, mongoose_1.Prop)()];
        _published_decorators = [(0, mongoose_1.Prop)({ default: false })];
        _publishedDate_decorators = [(0, mongoose_1.Prop)({ default: null })];
        _views_decorators = [(0, mongoose_1.Prop)({ default: 0 })];
        _hashtags_decorators = [(0, mongoose_1.Prop)({ type: [String], default: [] })];
        _linkedInPostId_decorators = [(0, mongoose_1.Prop)()];
        _createdBy_decorators = [(0, mongoose_1.Prop)({ required: true })];
        _updatedBy_decorators = [(0, mongoose_1.Prop)()];
        _analytics_decorators = [(0, mongoose_1.Prop)({ type: Object, default: {} })];
        _metadata_decorators = [(0, mongoose_1.Prop)({ type: Object, default: {} })];
        _createdAt_decorators = [(0, mongoose_1.Prop)()];
        _updatedAt_decorators = [(0, mongoose_1.Prop)()];
        __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: function (obj) { return "title" in obj; }, get: function (obj) { return obj.title; }, set: function (obj, value) { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
        __esDecorate(null, null, _content_decorators, { kind: "field", name: "content", static: false, private: false, access: { has: function (obj) { return "content" in obj; }, get: function (obj) { return obj.content; }, set: function (obj, value) { obj.content = value; } }, metadata: _metadata }, _content_initializers, _content_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _author_decorators, { kind: "field", name: "author", static: false, private: false, access: { has: function (obj) { return "author" in obj; }, get: function (obj) { return obj.author; }, set: function (obj, value) { obj.author = value; } }, metadata: _metadata }, _author_initializers, _author_extraInitializers);
        __esDecorate(null, null, _scheduledDate_decorators, { kind: "field", name: "scheduledDate", static: false, private: false, access: { has: function (obj) { return "scheduledDate" in obj; }, get: function (obj) { return obj.scheduledDate; }, set: function (obj, value) { obj.scheduledDate = value; } }, metadata: _metadata }, _scheduledDate_initializers, _scheduledDate_extraInitializers);
        __esDecorate(null, null, _likes_decorators, { kind: "field", name: "likes", static: false, private: false, access: { has: function (obj) { return "likes" in obj; }, get: function (obj) { return obj.likes; }, set: function (obj, value) { obj.likes = value; } }, metadata: _metadata }, _likes_initializers, _likes_extraInitializers);
        __esDecorate(null, null, _comments_decorators, { kind: "field", name: "comments", static: false, private: false, access: { has: function (obj) { return "comments" in obj; }, get: function (obj) { return obj.comments; }, set: function (obj, value) { obj.comments = value; } }, metadata: _metadata }, _comments_initializers, _comments_extraInitializers);
        __esDecorate(null, null, _shares_decorators, { kind: "field", name: "shares", static: false, private: false, access: { has: function (obj) { return "shares" in obj; }, get: function (obj) { return obj.shares; }, set: function (obj, value) { obj.shares = value; } }, metadata: _metadata }, _shares_initializers, _shares_extraInitializers);
        __esDecorate(null, null, _imageUrl_decorators, { kind: "field", name: "imageUrl", static: false, private: false, access: { has: function (obj) { return "imageUrl" in obj; }, get: function (obj) { return obj.imageUrl; }, set: function (obj, value) { obj.imageUrl = value; } }, metadata: _metadata }, _imageUrl_initializers, _imageUrl_extraInitializers);
        __esDecorate(null, null, _published_decorators, { kind: "field", name: "published", static: false, private: false, access: { has: function (obj) { return "published" in obj; }, get: function (obj) { return obj.published; }, set: function (obj, value) { obj.published = value; } }, metadata: _metadata }, _published_initializers, _published_extraInitializers);
        __esDecorate(null, null, _publishedDate_decorators, { kind: "field", name: "publishedDate", static: false, private: false, access: { has: function (obj) { return "publishedDate" in obj; }, get: function (obj) { return obj.publishedDate; }, set: function (obj, value) { obj.publishedDate = value; } }, metadata: _metadata }, _publishedDate_initializers, _publishedDate_extraInitializers);
        __esDecorate(null, null, _views_decorators, { kind: "field", name: "views", static: false, private: false, access: { has: function (obj) { return "views" in obj; }, get: function (obj) { return obj.views; }, set: function (obj, value) { obj.views = value; } }, metadata: _metadata }, _views_initializers, _views_extraInitializers);
        __esDecorate(null, null, _hashtags_decorators, { kind: "field", name: "hashtags", static: false, private: false, access: { has: function (obj) { return "hashtags" in obj; }, get: function (obj) { return obj.hashtags; }, set: function (obj, value) { obj.hashtags = value; } }, metadata: _metadata }, _hashtags_initializers, _hashtags_extraInitializers);
        __esDecorate(null, null, _linkedInPostId_decorators, { kind: "field", name: "linkedInPostId", static: false, private: false, access: { has: function (obj) { return "linkedInPostId" in obj; }, get: function (obj) { return obj.linkedInPostId; }, set: function (obj, value) { obj.linkedInPostId = value; } }, metadata: _metadata }, _linkedInPostId_initializers, _linkedInPostId_extraInitializers);
        __esDecorate(null, null, _createdBy_decorators, { kind: "field", name: "createdBy", static: false, private: false, access: { has: function (obj) { return "createdBy" in obj; }, get: function (obj) { return obj.createdBy; }, set: function (obj, value) { obj.createdBy = value; } }, metadata: _metadata }, _createdBy_initializers, _createdBy_extraInitializers);
        __esDecorate(null, null, _updatedBy_decorators, { kind: "field", name: "updatedBy", static: false, private: false, access: { has: function (obj) { return "updatedBy" in obj; }, get: function (obj) { return obj.updatedBy; }, set: function (obj, value) { obj.updatedBy = value; } }, metadata: _metadata }, _updatedBy_initializers, _updatedBy_extraInitializers);
        __esDecorate(null, null, _analytics_decorators, { kind: "field", name: "analytics", static: false, private: false, access: { has: function (obj) { return "analytics" in obj; }, get: function (obj) { return obj.analytics; }, set: function (obj, value) { obj.analytics = value; } }, metadata: _metadata }, _analytics_initializers, _analytics_extraInitializers);
        __esDecorate(null, null, _metadata_decorators, { kind: "field", name: "metadata", static: false, private: false, access: { has: function (obj) { return "metadata" in obj; }, get: function (obj) { return obj.metadata; }, set: function (obj, value) { obj.metadata = value; } }, metadata: _metadata }, _metadata_initializers, _metadata_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        LinkedInPost = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return LinkedInPost = _classThis;
}();
exports.LinkedInPost = LinkedInPost;
exports.LinkedInPostSchema = mongoose_1.SchemaFactory.createForClass(LinkedInPost);
exports.LinkedInPostSchema.index({ status: 1, createdAt: -1 });
exports.LinkedInPostSchema.index({ scheduledDate: 1 });
