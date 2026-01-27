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
exports.YouTubePostSchema = exports.YouTubePost = void 0;
var mongoose_1 = require("@nestjs/mongoose");
var mongoose_2 = require("mongoose");
var YouTubePost = function () {
    var _classDecorators = [(0, mongoose_1.Schema)({ timestamps: true })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = mongoose_2.Document;
    var _title_decorators;
    var _title_initializers = [];
    var _title_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _videoId_decorators;
    var _videoId_initializers = [];
    var _videoId_extraInitializers = [];
    var _author_decorators;
    var _author_initializers = [];
    var _author_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _thumbnailUrl_decorators;
    var _thumbnailUrl_initializers = [];
    var _thumbnailUrl_extraInitializers = [];
    var _views_decorators;
    var _views_initializers = [];
    var _views_extraInitializers = [];
    var _likes_decorators;
    var _likes_initializers = [];
    var _likes_extraInitializers = [];
    var _publishedDate_decorators;
    var _publishedDate_initializers = [];
    var _publishedDate_extraInitializers = [];
    var YouTubePost = _classThis = /** @class */ (function (_super) {
        __extends(YouTubePost_1, _super);
        function YouTubePost_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.title = __runInitializers(_this, _title_initializers, void 0);
            _this.description = (__runInitializers(_this, _title_extraInitializers), __runInitializers(_this, _description_initializers, void 0));
            _this.videoId = (__runInitializers(_this, _description_extraInitializers), __runInitializers(_this, _videoId_initializers, void 0));
            _this.author = (__runInitializers(_this, _videoId_extraInitializers), __runInitializers(_this, _author_initializers, void 0));
            _this.status = (__runInitializers(_this, _author_extraInitializers), __runInitializers(_this, _status_initializers, void 0));
            _this.thumbnailUrl = (__runInitializers(_this, _status_extraInitializers), __runInitializers(_this, _thumbnailUrl_initializers, void 0));
            _this.views = (__runInitializers(_this, _thumbnailUrl_extraInitializers), __runInitializers(_this, _views_initializers, void 0));
            _this.likes = (__runInitializers(_this, _views_extraInitializers), __runInitializers(_this, _likes_initializers, void 0));
            _this.publishedDate = (__runInitializers(_this, _likes_extraInitializers), __runInitializers(_this, _publishedDate_initializers, void 0));
            __runInitializers(_this, _publishedDate_extraInitializers);
            return _this;
        }
        return YouTubePost_1;
    }(_classSuper));
    __setFunctionName(_classThis, "YouTubePost");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _title_decorators = [(0, mongoose_1.Prop)({ required: true })];
        _description_decorators = [(0, mongoose_1.Prop)({ required: true })];
        _videoId_decorators = [(0, mongoose_1.Prop)({ required: true })];
        _author_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true })];
        _status_decorators = [(0, mongoose_1.Prop)({ enum: ['draft', 'published'], default: 'draft' })];
        _thumbnailUrl_decorators = [(0, mongoose_1.Prop)()];
        _views_decorators = [(0, mongoose_1.Prop)({ default: 0 })];
        _likes_decorators = [(0, mongoose_1.Prop)({ default: 0 })];
        _publishedDate_decorators = [(0, mongoose_1.Prop)()];
        __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: function (obj) { return "title" in obj; }, get: function (obj) { return obj.title; }, set: function (obj, value) { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
        __esDecorate(null, null, _videoId_decorators, { kind: "field", name: "videoId", static: false, private: false, access: { has: function (obj) { return "videoId" in obj; }, get: function (obj) { return obj.videoId; }, set: function (obj, value) { obj.videoId = value; } }, metadata: _metadata }, _videoId_initializers, _videoId_extraInitializers);
        __esDecorate(null, null, _author_decorators, { kind: "field", name: "author", static: false, private: false, access: { has: function (obj) { return "author" in obj; }, get: function (obj) { return obj.author; }, set: function (obj, value) { obj.author = value; } }, metadata: _metadata }, _author_initializers, _author_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _thumbnailUrl_decorators, { kind: "field", name: "thumbnailUrl", static: false, private: false, access: { has: function (obj) { return "thumbnailUrl" in obj; }, get: function (obj) { return obj.thumbnailUrl; }, set: function (obj, value) { obj.thumbnailUrl = value; } }, metadata: _metadata }, _thumbnailUrl_initializers, _thumbnailUrl_extraInitializers);
        __esDecorate(null, null, _views_decorators, { kind: "field", name: "views", static: false, private: false, access: { has: function (obj) { return "views" in obj; }, get: function (obj) { return obj.views; }, set: function (obj, value) { obj.views = value; } }, metadata: _metadata }, _views_initializers, _views_extraInitializers);
        __esDecorate(null, null, _likes_decorators, { kind: "field", name: "likes", static: false, private: false, access: { has: function (obj) { return "likes" in obj; }, get: function (obj) { return obj.likes; }, set: function (obj, value) { obj.likes = value; } }, metadata: _metadata }, _likes_initializers, _likes_extraInitializers);
        __esDecorate(null, null, _publishedDate_decorators, { kind: "field", name: "publishedDate", static: false, private: false, access: { has: function (obj) { return "publishedDate" in obj; }, get: function (obj) { return obj.publishedDate; }, set: function (obj, value) { obj.publishedDate = value; } }, metadata: _metadata }, _publishedDate_initializers, _publishedDate_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        YouTubePost = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return YouTubePost = _classThis;
}();
exports.YouTubePost = YouTubePost;
exports.YouTubePostSchema = mongoose_1.SchemaFactory.createForClass(YouTubePost);
