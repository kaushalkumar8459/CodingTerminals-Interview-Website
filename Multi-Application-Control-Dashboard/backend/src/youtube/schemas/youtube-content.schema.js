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
exports.YouTubeContentSchema = exports.YouTubeContent = exports.VideoStatus = void 0;
var mongoose_1 = require("@nestjs/mongoose");
var mongoose_2 = require("mongoose");
var VideoStatus;
(function (VideoStatus) {
    VideoStatus["DRAFT"] = "draft";
    VideoStatus["PUBLISHED"] = "published";
    VideoStatus["ARCHIVED"] = "archived";
})(VideoStatus || (exports.VideoStatus = VideoStatus = {}));
var YouTubeContent = function () {
    var _classDecorators = [(0, mongoose_1.Schema)({ timestamps: true })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _title_decorators;
    var _title_initializers = [];
    var _title_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _videoId_decorators;
    var _videoId_initializers = [];
    var _videoId_extraInitializers = [];
    var _videoUrl_decorators;
    var _videoUrl_initializers = [];
    var _videoUrl_extraInitializers = [];
    var _thumbnail_decorators;
    var _thumbnail_initializers = [];
    var _thumbnail_extraInitializers = [];
    var _thumbnailUrl_decorators;
    var _thumbnailUrl_initializers = [];
    var _thumbnailUrl_extraInitializers = [];
    var _duration_decorators;
    var _duration_initializers = [];
    var _duration_extraInitializers = [];
    var _category_decorators;
    var _category_initializers = [];
    var _category_extraInitializers = [];
    var _tags_decorators;
    var _tags_initializers = [];
    var _tags_extraInitializers = [];
    var _playlists_decorators;
    var _playlists_initializers = [];
    var _playlists_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _createdBy_decorators;
    var _createdBy_initializers = [];
    var _createdBy_extraInitializers = [];
    var _lastModifiedBy_decorators;
    var _lastModifiedBy_initializers = [];
    var _lastModifiedBy_extraInitializers = [];
    var _views_decorators;
    var _views_initializers = [];
    var _views_extraInitializers = [];
    var _likes_decorators;
    var _likes_initializers = [];
    var _likes_extraInitializers = [];
    var _publishedAt_decorators;
    var _publishedAt_initializers = [];
    var _publishedAt_extraInitializers = [];
    var _isPublished_decorators;
    var _isPublished_initializers = [];
    var _isPublished_extraInitializers = [];
    var _metadata_decorators;
    var _metadata_initializers = [];
    var _metadata_extraInitializers = [];
    var YouTubeContent = _classThis = /** @class */ (function () {
        function YouTubeContent_1() {
            this.title = __runInitializers(this, _title_initializers, void 0);
            this.description = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _description_initializers, void 0));
            this.videoId = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _videoId_initializers, void 0));
            this.videoUrl = (__runInitializers(this, _videoId_extraInitializers), __runInitializers(this, _videoUrl_initializers, void 0));
            this.thumbnail = (__runInitializers(this, _videoUrl_extraInitializers), __runInitializers(this, _thumbnail_initializers, void 0));
            this.thumbnailUrl = (__runInitializers(this, _thumbnail_extraInitializers), __runInitializers(this, _thumbnailUrl_initializers, void 0));
            this.duration = (__runInitializers(this, _thumbnailUrl_extraInitializers), __runInitializers(this, _duration_initializers, void 0));
            this.category = (__runInitializers(this, _duration_extraInitializers), __runInitializers(this, _category_initializers, void 0));
            this.tags = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _tags_initializers, void 0));
            this.playlists = (__runInitializers(this, _tags_extraInitializers), __runInitializers(this, _playlists_initializers, void 0));
            this.status = (__runInitializers(this, _playlists_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.createdBy = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _createdBy_initializers, void 0));
            this.lastModifiedBy = (__runInitializers(this, _createdBy_extraInitializers), __runInitializers(this, _lastModifiedBy_initializers, void 0));
            this.views = (__runInitializers(this, _lastModifiedBy_extraInitializers), __runInitializers(this, _views_initializers, void 0));
            this.likes = (__runInitializers(this, _views_extraInitializers), __runInitializers(this, _likes_initializers, void 0));
            this.publishedAt = (__runInitializers(this, _likes_extraInitializers), __runInitializers(this, _publishedAt_initializers, void 0));
            this.isPublished = (__runInitializers(this, _publishedAt_extraInitializers), __runInitializers(this, _isPublished_initializers, void 0));
            this.metadata = (__runInitializers(this, _isPublished_extraInitializers), __runInitializers(this, _metadata_initializers, void 0));
            __runInitializers(this, _metadata_extraInitializers);
        }
        return YouTubeContent_1;
    }());
    __setFunctionName(_classThis, "YouTubeContent");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _title_decorators = [(0, mongoose_1.Prop)({ required: true })];
        _description_decorators = [(0, mongoose_1.Prop)()];
        _videoId_decorators = [(0, mongoose_1.Prop)({ required: true })];
        _videoUrl_decorators = [(0, mongoose_1.Prop)()];
        _thumbnail_decorators = [(0, mongoose_1.Prop)()];
        _thumbnailUrl_decorators = [(0, mongoose_1.Prop)()];
        _duration_decorators = [(0, mongoose_1.Prop)()];
        _category_decorators = [(0, mongoose_1.Prop)()];
        _tags_decorators = [(0, mongoose_1.Prop)({ type: [String], default: [] })];
        _playlists_decorators = [(0, mongoose_1.Prop)({ type: [String], default: [] })];
        _status_decorators = [(0, mongoose_1.Prop)({ enum: VideoStatus, default: VideoStatus.DRAFT })];
        _createdBy_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true })];
        _lastModifiedBy_decorators = [(0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' })];
        _views_decorators = [(0, mongoose_1.Prop)({ default: 0 })];
        _likes_decorators = [(0, mongoose_1.Prop)({ default: 0 })];
        _publishedAt_decorators = [(0, mongoose_1.Prop)()];
        _isPublished_decorators = [(0, mongoose_1.Prop)({ default: false })];
        _metadata_decorators = [(0, mongoose_1.Prop)({ type: Object, default: {} })];
        __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: function (obj) { return "title" in obj; }, get: function (obj) { return obj.title; }, set: function (obj, value) { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
        __esDecorate(null, null, _videoId_decorators, { kind: "field", name: "videoId", static: false, private: false, access: { has: function (obj) { return "videoId" in obj; }, get: function (obj) { return obj.videoId; }, set: function (obj, value) { obj.videoId = value; } }, metadata: _metadata }, _videoId_initializers, _videoId_extraInitializers);
        __esDecorate(null, null, _videoUrl_decorators, { kind: "field", name: "videoUrl", static: false, private: false, access: { has: function (obj) { return "videoUrl" in obj; }, get: function (obj) { return obj.videoUrl; }, set: function (obj, value) { obj.videoUrl = value; } }, metadata: _metadata }, _videoUrl_initializers, _videoUrl_extraInitializers);
        __esDecorate(null, null, _thumbnail_decorators, { kind: "field", name: "thumbnail", static: false, private: false, access: { has: function (obj) { return "thumbnail" in obj; }, get: function (obj) { return obj.thumbnail; }, set: function (obj, value) { obj.thumbnail = value; } }, metadata: _metadata }, _thumbnail_initializers, _thumbnail_extraInitializers);
        __esDecorate(null, null, _thumbnailUrl_decorators, { kind: "field", name: "thumbnailUrl", static: false, private: false, access: { has: function (obj) { return "thumbnailUrl" in obj; }, get: function (obj) { return obj.thumbnailUrl; }, set: function (obj, value) { obj.thumbnailUrl = value; } }, metadata: _metadata }, _thumbnailUrl_initializers, _thumbnailUrl_extraInitializers);
        __esDecorate(null, null, _duration_decorators, { kind: "field", name: "duration", static: false, private: false, access: { has: function (obj) { return "duration" in obj; }, get: function (obj) { return obj.duration; }, set: function (obj, value) { obj.duration = value; } }, metadata: _metadata }, _duration_initializers, _duration_extraInitializers);
        __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: function (obj) { return "category" in obj; }, get: function (obj) { return obj.category; }, set: function (obj, value) { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
        __esDecorate(null, null, _tags_decorators, { kind: "field", name: "tags", static: false, private: false, access: { has: function (obj) { return "tags" in obj; }, get: function (obj) { return obj.tags; }, set: function (obj, value) { obj.tags = value; } }, metadata: _metadata }, _tags_initializers, _tags_extraInitializers);
        __esDecorate(null, null, _playlists_decorators, { kind: "field", name: "playlists", static: false, private: false, access: { has: function (obj) { return "playlists" in obj; }, get: function (obj) { return obj.playlists; }, set: function (obj, value) { obj.playlists = value; } }, metadata: _metadata }, _playlists_initializers, _playlists_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _createdBy_decorators, { kind: "field", name: "createdBy", static: false, private: false, access: { has: function (obj) { return "createdBy" in obj; }, get: function (obj) { return obj.createdBy; }, set: function (obj, value) { obj.createdBy = value; } }, metadata: _metadata }, _createdBy_initializers, _createdBy_extraInitializers);
        __esDecorate(null, null, _lastModifiedBy_decorators, { kind: "field", name: "lastModifiedBy", static: false, private: false, access: { has: function (obj) { return "lastModifiedBy" in obj; }, get: function (obj) { return obj.lastModifiedBy; }, set: function (obj, value) { obj.lastModifiedBy = value; } }, metadata: _metadata }, _lastModifiedBy_initializers, _lastModifiedBy_extraInitializers);
        __esDecorate(null, null, _views_decorators, { kind: "field", name: "views", static: false, private: false, access: { has: function (obj) { return "views" in obj; }, get: function (obj) { return obj.views; }, set: function (obj, value) { obj.views = value; } }, metadata: _metadata }, _views_initializers, _views_extraInitializers);
        __esDecorate(null, null, _likes_decorators, { kind: "field", name: "likes", static: false, private: false, access: { has: function (obj) { return "likes" in obj; }, get: function (obj) { return obj.likes; }, set: function (obj, value) { obj.likes = value; } }, metadata: _metadata }, _likes_initializers, _likes_extraInitializers);
        __esDecorate(null, null, _publishedAt_decorators, { kind: "field", name: "publishedAt", static: false, private: false, access: { has: function (obj) { return "publishedAt" in obj; }, get: function (obj) { return obj.publishedAt; }, set: function (obj, value) { obj.publishedAt = value; } }, metadata: _metadata }, _publishedAt_initializers, _publishedAt_extraInitializers);
        __esDecorate(null, null, _isPublished_decorators, { kind: "field", name: "isPublished", static: false, private: false, access: { has: function (obj) { return "isPublished" in obj; }, get: function (obj) { return obj.isPublished; }, set: function (obj, value) { obj.isPublished = value; } }, metadata: _metadata }, _isPublished_initializers, _isPublished_extraInitializers);
        __esDecorate(null, null, _metadata_decorators, { kind: "field", name: "metadata", static: false, private: false, access: { has: function (obj) { return "metadata" in obj; }, get: function (obj) { return obj.metadata; }, set: function (obj, value) { obj.metadata = value; } }, metadata: _metadata }, _metadata_initializers, _metadata_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        YouTubeContent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return YouTubeContent = _classThis;
}();
exports.YouTubeContent = YouTubeContent;
exports.YouTubeContentSchema = mongoose_1.SchemaFactory.createForClass(YouTubeContent);
