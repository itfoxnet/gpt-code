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
Object.defineProperty(exports, "__esModule", { value: true });
var file_system_1 = require("../core/file_system");
var api_error_1 = require("../core/api_error");
var file_flag_1 = require("../core/file_flag");
var util_1 = require("../core/util");
var node_fs_stats_1 = require("../core/node_fs_stats");
var preload_file_1 = require("../generic/preload_file");
var xhr_1 = require("../generic/xhr");
var fetch_1 = require("../generic/fetch");
var file_index_1 = require("../generic/file_index");
/**
 * Try to convert the given buffer into a string, and pass it to the callback.
 * Optimization that removes the needed try/catch into a helper function, as
 * this is an uncommon case.
 * @hidden
 */
function tryToString(buff, encoding, cb) {
    try {
        cb(null, buff.toString(encoding));
    }
    catch (e) {
        cb(e);
    }
}
function syncNotAvailableError() {
    throw new api_error_1.ApiError(api_error_1.ErrorCode.ENOTSUP, "Synchronous HTTP download methods are not available in this environment.");
}
/**
 * A simple filesystem backed by HTTP downloads. You must create a directory listing using the
 * `make_http_index` tool provided by BrowserFS.
 *
 * If you install BrowserFS globally with `npm i -g browserfs`, you can generate a listing by
 * running `make_http_index` in your terminal in the directory you would like to index:
 *
 * ```
 * make_http_index > index.json
 * ```
 *
 * Listings objects look like the following:
 *
 * ```json
 * {
 *   "home": {
 *     "jvilk": {
 *       "someFile.txt": null,
 *       "someDir": {
 *         // Empty directory
 *       }
 *     }
 *   }
 * }
 * ```
 *
 * *This example has the folder `/home/jvilk` with subfile `someFile.txt` and subfolder `someDir`.*
 */
var JSDelivrRequest = /** @class */ (function (_super) {
    __extends(JSDelivrRequest, _super);
    function JSDelivrRequest(meta, dependency, version, preferXHR) {
        if (preferXHR === void 0) { preferXHR = false; }
        var _this = _super.call(this) || this;
        _this.dependency = dependency;
        _this.version = version;
        _this._index = file_index_1.FileIndex.fromJSDelivr(meta);
        if (fetch_1.fetchIsAvailable && (!preferXHR || !xhr_1.xhrIsAvailable)) {
            _this._requestFileAsyncInternal = fetch_1.fetchFileAsync;
            _this._requestFileSizeAsyncInternal = fetch_1.fetchFileSizeAsync;
        }
        else {
            _this._requestFileAsyncInternal = xhr_1.asyncDownloadFile;
            _this._requestFileSizeAsyncInternal = xhr_1.getFileSizeAsync;
        }
        if (xhr_1.xhrIsAvailable) {
            _this._requestFileSyncInternal = xhr_1.syncDownloadFile;
            _this._requestFileSizeSyncInternal = xhr_1.getFileSizeSync;
        }
        else {
            _this._requestFileSyncInternal = syncNotAvailableError;
            _this._requestFileSizeSyncInternal = syncNotAvailableError;
        }
        return _this;
    }
    /**
     * Construct an HTTPRequest file system backend with the given options.
     */
    JSDelivrRequest.Create = function (opts, cb) {
        var URL = "https://data.jsdelivr.com/v1/package/npm/".concat(opts.dependency, "@").concat(opts.version, "/flat");
        (0, xhr_1.asyncDownloadFile)(URL, "json", function (e, data) {
            if (e) {
                cb(e);
            }
            else {
                cb(null, new JSDelivrRequest(data, opts.dependency, opts.version));
            }
        });
    };
    JSDelivrRequest.isAvailable = function () {
        return xhr_1.xhrIsAvailable || fetch_1.fetchIsAvailable;
    };
    JSDelivrRequest.prototype.empty = function () {
        this._index.fileIterator(function (file) {
            file.fileData = null;
        });
    };
    JSDelivrRequest.prototype.getName = function () {
        return JSDelivrRequest.Name;
    };
    JSDelivrRequest.prototype.diskSpace = function (path, cb) {
        // Read-only file system. We could calculate the total space, but that's not
        // important right now.
        cb(0, 0);
    };
    JSDelivrRequest.prototype.isReadOnly = function () {
        return true;
    };
    JSDelivrRequest.prototype.supportsLinks = function () {
        return false;
    };
    JSDelivrRequest.prototype.supportsProps = function () {
        return false;
    };
    JSDelivrRequest.prototype.supportsSynch = function () {
        // Synchronous operations are only available via the XHR interface for now.
        return xhr_1.xhrIsAvailable;
    };
    /**
     * Special HTTPFS function: Preload the given file into the index.
     * @param [String] path
     * @param [BrowserFS.Buffer] buffer
     */
    JSDelivrRequest.prototype.preloadFile = function (path, buffer) {
        var inode = this._index.getInode(path);
        if ((0, file_index_1.isFileInode)(inode)) {
            if (inode === null) {
                throw api_error_1.ApiError.ENOENT(path);
            }
            var stats = inode.getData();
            stats.size = buffer.length;
            stats.fileData = buffer;
        }
        else {
            throw api_error_1.ApiError.EISDIR(path);
        }
    };
    JSDelivrRequest.prototype.stat = function (path, isLstat, cb) {
        var inode = this._index.getInode(path);
        if (inode === null) {
            return cb(api_error_1.ApiError.ENOENT(path));
        }
        var stats;
        if ((0, file_index_1.isFileInode)(inode)) {
            stats = inode.getData();
            // At this point, a non-opened file will still have default stats from the listing.
            if (stats.size < 0) {
                this._requestFileSizeAsync(path, function (e, size) {
                    if (e) {
                        return cb(e);
                    }
                    stats.size = size;
                    cb(null, node_fs_stats_1.default.clone(stats));
                });
            }
            else {
                cb(null, node_fs_stats_1.default.clone(stats));
            }
        }
        else if ((0, file_index_1.isDirInode)(inode)) {
            stats = inode.getStats();
            cb(null, stats);
        }
        else {
            cb(api_error_1.ApiError.FileError(api_error_1.ErrorCode.EINVAL, path));
        }
    };
    JSDelivrRequest.prototype.statSync = function (path, isLstat) {
        var inode = this._index.getInode(path);
        if (inode === null) {
            throw api_error_1.ApiError.ENOENT(path);
        }
        var stats;
        if ((0, file_index_1.isFileInode)(inode)) {
            stats = inode.getData();
            // At this point, a non-opened file will still have default stats from the listing.
            if (stats.size < 0) {
                stats.size = this._requestFileSizeSync(path);
            }
        }
        else if ((0, file_index_1.isDirInode)(inode)) {
            stats = inode.getStats();
        }
        else {
            throw api_error_1.ApiError.FileError(api_error_1.ErrorCode.EINVAL, path);
        }
        return stats;
    };
    JSDelivrRequest.prototype.open = function (path, flags, mode, cb) {
        // INVARIANT: You can't write to files on this file system.
        if (flags.isWriteable()) {
            return cb(new api_error_1.ApiError(api_error_1.ErrorCode.EPERM, path));
        }
        var self = this;
        // Check if the path exists, and is a file.
        var inode = this._index.getInode(path);
        if (inode === null) {
            return cb(api_error_1.ApiError.ENOENT(path));
        }
        if ((0, file_index_1.isFileInode)(inode)) {
            var stats_1 = inode.getData();
            switch (flags.pathExistsAction()) {
                case file_flag_1.ActionType.THROW_EXCEPTION:
                case file_flag_1.ActionType.TRUNCATE_FILE:
                    return cb(api_error_1.ApiError.EEXIST(path));
                case file_flag_1.ActionType.NOP:
                    // Use existing file contents.
                    // XXX: Uh, this maintains the previously-used flag.
                    if (stats_1.fileData) {
                        return cb(null, new preload_file_1.NoSyncFile(self, path, flags, node_fs_stats_1.default.clone(stats_1), stats_1.fileData));
                    }
                    // @todo be lazier about actually requesting the file
                    this._requestFileAsync(path, 'buffer', function (err, buffer) {
                        if (err) {
                            return cb(err);
                        }
                        // we don't initially have file sizes
                        stats_1.size = buffer.length;
                        stats_1.fileData = buffer;
                        return cb(null, new preload_file_1.NoSyncFile(self, path, flags, node_fs_stats_1.default.clone(stats_1), buffer));
                    });
                    break;
                default:
                    return cb(new api_error_1.ApiError(api_error_1.ErrorCode.EINVAL, 'Invalid FileMode object.'));
            }
        }
        else {
            return cb(api_error_1.ApiError.EISDIR(path));
        }
    };
    JSDelivrRequest.prototype.openSync = function (path, flags, mode) {
        // INVARIANT: You can't write to files on this file system.
        if (flags.isWriteable()) {
            throw new api_error_1.ApiError(api_error_1.ErrorCode.EPERM, path);
        }
        // Check if the path exists, and is a file.
        var inode = this._index.getInode(path);
        if (inode === null) {
            throw api_error_1.ApiError.ENOENT(path);
        }
        if ((0, file_index_1.isFileInode)(inode)) {
            var stats = inode.getData();
            switch (flags.pathExistsAction()) {
                case file_flag_1.ActionType.THROW_EXCEPTION:
                case file_flag_1.ActionType.TRUNCATE_FILE:
                    throw api_error_1.ApiError.EEXIST(path);
                case file_flag_1.ActionType.NOP:
                    // Use existing file contents.
                    // XXX: Uh, this maintains the previously-used flag.
                    if (stats.fileData) {
                        return new preload_file_1.NoSyncFile(this, path, flags, node_fs_stats_1.default.clone(stats), stats.fileData);
                    }
                    // @todo be lazier about actually requesting the file
                    var buffer = this._requestFileSync(path, 'buffer');
                    // we don't initially have file sizes
                    stats.size = buffer.length;
                    stats.fileData = buffer;
                    return new preload_file_1.NoSyncFile(this, path, flags, node_fs_stats_1.default.clone(stats), buffer);
                default:
                    throw new api_error_1.ApiError(api_error_1.ErrorCode.EINVAL, 'Invalid FileMode object.');
            }
        }
        else {
            throw api_error_1.ApiError.EISDIR(path);
        }
    };
    JSDelivrRequest.prototype.readdir = function (path, cb) {
        try {
            cb(null, this.readdirSync(path));
        }
        catch (e) {
            cb(e);
        }
    };
    JSDelivrRequest.prototype.readdirSync = function (path) {
        // Check if it exists.
        var inode = this._index.getInode(path);
        if (inode === null) {
            throw api_error_1.ApiError.ENOENT(path);
        }
        else if ((0, file_index_1.isDirInode)(inode)) {
            return inode.getListing();
        }
        else {
            throw api_error_1.ApiError.ENOTDIR(path);
        }
    };
    /**
     * We have the entire file as a buffer; optimize readFile.
     */
    JSDelivrRequest.prototype.readFile = function (fname, encoding, flag, cb) {
        // Wrap cb in file closing code.
        var oldCb = cb;
        // Get file.
        this.open(fname, flag, 0x1a4, function (err, fd) {
            if (err) {
                return cb(err);
            }
            cb = function (err, arg) {
                fd.close(function (err2) {
                    if (!err) {
                        err = err2;
                    }
                    return oldCb(err, arg);
                });
            };
            var fdCast = fd;
            var fdBuff = fdCast.getBuffer();
            if (encoding === null) {
                cb(err, (0, util_1.copyingSlice)(fdBuff));
            }
            else {
                tryToString(fdBuff, encoding, cb);
            }
        });
    };
    /**
     * Specially-optimized readfile.
     */
    JSDelivrRequest.prototype.readFileSync = function (fname, encoding, flag) {
        // Get file.
        var fd = this.openSync(fname, flag, 0x1a4);
        try {
            var fdCast = fd;
            var fdBuff = fdCast.getBuffer();
            if (encoding === null) {
                return (0, util_1.copyingSlice)(fdBuff);
            }
            return fdBuff.toString(encoding);
        }
        finally {
            fd.closeSync();
        }
    };
    JSDelivrRequest.prototype._getHTTPPath = function (filePath) {
        if (filePath.charAt(0) === '/') {
            filePath = filePath.slice(1);
        }
        return "https://cdn.jsdelivr.net/npm/".concat(this.dependency, "@").concat(this.version, "/").concat(filePath);
    };
    JSDelivrRequest.prototype._requestFileAsync = function (p, type, cb) {
        this._requestFileAsyncInternal(this._getHTTPPath(p), type, cb);
    };
    JSDelivrRequest.prototype._requestFileSync = function (p, type) {
        return this._requestFileSyncInternal(this._getHTTPPath(p), type);
    };
    /**
     * Only requests the HEAD content, for the file size.
     */
    JSDelivrRequest.prototype._requestFileSizeAsync = function (path, cb) {
        this._requestFileSizeAsyncInternal(this._getHTTPPath(path), cb);
    };
    JSDelivrRequest.prototype._requestFileSizeSync = function (path) {
        return this._requestFileSizeSyncInternal(this._getHTTPPath(path));
    };
    JSDelivrRequest.Name = "JSDelivrRequest";
    JSDelivrRequest.Options = {
        dependency: {
            type: "string",
            description: "Name of dependency"
        },
        version: {
            type: "string",
            description: "Version of dependency, has to be absolute"
        },
        preferXHR: {
            type: "boolean",
            optional: true,
            description: "Whether to prefer XmlHttpRequest or fetch for async operations if both are available. Default: false"
        }
    };
    return JSDelivrRequest;
}(file_system_1.BaseFileSystem));
exports.default = JSDelivrRequest;
//# sourceMappingURL=JSDelivrRequest.js.map