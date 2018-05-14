import * as tslib_1 from "tslib";
import { binToString } from '../../bin';
import { normalizeBin, vgField } from '../../fielddef';
import { duplicate, flatten, keys, vals } from '../../util';
import { binFormatExpression, binRequiresRange } from '../common';
import { isUnitModel } from '../model';
import { DataFlowNode } from './dataflow';
function rangeFormula(model, fieldDef, channel, config) {
    if (binRequiresRange(fieldDef, channel)) {
        // read format from axis or legend, if there is no format then use config.numberFormat
        var guide = isUnitModel(model) ? (model.axis(channel) || model.legend(channel) || {}) : {};
        var startField = vgField(fieldDef, { expr: 'datum', });
        var endField = vgField(fieldDef, { expr: 'datum', binSuffix: 'end' });
        return {
            formulaAs: vgField(fieldDef, { binSuffix: 'range' }),
            formula: binFormatExpression(startField, endField, guide.format, config)
        };
    }
    return {};
}
function binKey(bin, field) {
    return binToString(bin) + "_" + field;
}
function getSignalsFromModel(model, key) {
    return {
        signal: model.getName(key + "_bins"),
        extentSignal: model.getName(key + "_extent")
    };
}
function isBinTransform(t) {
    return 'as' in t;
}
function createBinComponent(t, model) {
    var as;
    if (isBinTransform(t)) {
        as = [t.as, t.as + "_end"];
    }
    else {
        as = [vgField(t, {}), vgField(t, { binSuffix: 'end' })];
    }
    var bin = normalizeBin(t.bin, undefined) || {};
    var key = binKey(bin, t.field);
    var _a = getSignalsFromModel(model, key), signal = _a.signal, extentSignal = _a.extentSignal;
    var binComponent = tslib_1.__assign({ bin: bin, field: t.field, as: as }, signal ? { signal: signal } : {}, extentSignal ? { extentSignal: extentSignal } : {});
    return { key: key, binComponent: binComponent };
}
var BinNode = /** @class */ (function (_super) {
    tslib_1.__extends(BinNode, _super);
    function BinNode(parent, bins) {
        var _this = _super.call(this, parent) || this;
        _this.bins = bins;
        return _this;
    }
    BinNode.prototype.clone = function () {
        return new BinNode(null, duplicate(this.bins));
    };
    BinNode.makeFromEncoding = function (parent, model) {
        var bins = model.reduceFieldDef(function (binComponentIndex, fieldDef, channel) {
            if (fieldDef.bin) {
                var _a = createBinComponent(fieldDef, model), key = _a.key, binComponent = _a.binComponent;
                binComponentIndex[key] = tslib_1.__assign({}, binComponent, binComponentIndex[key], rangeFormula(model, fieldDef, channel, model.config));
            }
            return binComponentIndex;
        }, {});
        if (keys(bins).length === 0) {
            return null;
        }
        return new BinNode(parent, bins);
    };
    /**
     * Creates a bin node from BinTransform.
     * The optional parameter should provide
     */
    BinNode.makeFromTransform = function (parent, t, model) {
        var _a = createBinComponent(t, model), key = _a.key, binComponent = _a.binComponent;
        return new BinNode(parent, (_b = {},
            _b[key] = binComponent,
            _b));
        var _b;
    };
    BinNode.prototype.merge = function (other) {
        this.bins = tslib_1.__assign({}, this.bins, other.bins);
        other.remove();
    };
    BinNode.prototype.producedFields = function () {
        var out = {};
        vals(this.bins).forEach(function (c) {
            c.as.forEach(function (f) { return out[f] = true; });
        });
        return out;
    };
    BinNode.prototype.dependentFields = function () {
        var out = {};
        vals(this.bins).forEach(function (c) {
            out[c.field] = true;
        });
        return out;
    };
    BinNode.prototype.assemble = function () {
        return flatten(vals(this.bins).map(function (bin) {
            var transform = [];
            var binTrans = tslib_1.__assign({ type: 'bin', field: bin.field, as: bin.as, signal: bin.signal }, bin.bin);
            if (!bin.bin.extent && bin.extentSignal) {
                transform.push({
                    type: 'extent',
                    field: bin.field,
                    signal: bin.extentSignal
                });
                binTrans.extent = { signal: bin.extentSignal };
            }
            transform.push(binTrans);
            if (bin.formula) {
                transform.push({
                    type: 'formula',
                    expr: bin.formula,
                    as: bin.formulaAs
                });
            }
            return transform;
        }));
    };
    return BinNode;
}(DataFlowNode));
export { BinNode };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBpbGUvZGF0YS9iaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBWSxXQUFXLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFHakQsT0FBTyxFQUFXLFlBQVksRUFBRSxPQUFPLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUUvRCxPQUFPLEVBQU8sU0FBUyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRWhFLE9BQU8sRUFBQyxtQkFBbUIsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUNoRSxPQUFPLEVBQUMsV0FBVyxFQUF3QixNQUFNLFVBQVUsQ0FBQztBQUM1RCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBR3hDLHNCQUFzQixLQUFxQixFQUFFLFFBQTBCLEVBQUUsT0FBZ0IsRUFBRSxNQUFjO0lBQ3JHLElBQUksZ0JBQWdCLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFO1FBQ3ZDLHNGQUFzRjtRQUV0RixJQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFN0YsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxPQUFPLEdBQUUsQ0FBQyxDQUFDO1FBQ3ZELElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1FBRXRFLE9BQU87WUFDTCxTQUFTLEVBQUUsT0FB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QUFDO0lBQ0gsY0FBQztBQUFELENBQUMsQUFuR0QsQ0FBNkIsWUFBWSxHQW1HeEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0JpblBhcmFtcywgYmluVG9TdHJpbmd9IGZyb20gJy4uLy4uL2Jpbic7XG5pbXBvcnQge0NoYW5uZWx9IGZyb20gJy4uLy4uL2NoYW5uZWwnO1xuaW1wb3J0IHtDb25maWd9IGZyb20gJy4uLy4uL2NvbmZpZyc7XG5pbXBvcnQge0ZpZWxkRGVmLCBub3JtYWxpemVCaW4sIHZnRmllbGR9IGZyb20gJy4uLy4uL2ZpZWxkZGVmJztcbmltcG9ydCB7QmluVHJhbnNmb3JtfSBmcm9tICcuLi8uLi90cmFuc2Zvcm0nO1xuaW1wb3J0IHtEaWN0LCBkdXBsaWNhdGUsIGZsYXR0ZW4sIGtleXMsIHZhbHN9IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0IHtWZ0JpblRyYW5zZm9ybSwgVmdUcmFuc2Zvcm19IGZyb20gJy4uLy4uL3ZlZ2Euc2NoZW1hJztcbmltcG9ydCB7YmluRm9ybWF0RXhwcmVzc2lvbiwgYmluUmVxdWlyZXNSYW5nZX0gZnJvbSAnLi4vY29tbW9uJztcbmltcG9ydCB7aXNVbml0TW9kZWwsIE1vZGVsLCBNb2RlbFdpdGhGaWVsZH0gZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0IHtEYXRhRmxvd05vZGV9IGZyb20gJy4vZGF0YWZsb3cnO1xuXG5cbmZ1bmN0aW9uIHJhbmdlRm9ybXVsYShtb2RlbDogTW9kZWxXaXRoRmllbGQsIGZpZWxkRGVmOiBGaWVsZERlZjxzdHJpbmc+LCBjaGFubmVsOiBDaGFubmVsLCBjb25maWc6IENvbmZpZykge1xuICAgIGlmIChiaW5SZXF1aXJlc1JhbmdlKGZpZWxkRGVmLCBjaGFubmVsKSkge1xuICAgICAgLy8gcmVhZCBmb3JtYXQgZnJvbSBheGlzIG9yIGxlZ2VuZCwgaWYgdGhlcmUgaXMgbm8gZm9ybWF0IHRoZW4gdXNlIGNvbmZpZy5udW1iZXJGb3JtYXRcblxuICAgICAgY29uc3QgZ3VpZGUgPSBpc1VuaXRNb2RlbChtb2RlbCkgPyAobW9kZWwuYXhpcyhjaGFubmVsKSB8fCBtb2RlbC5sZWdlbmQoY2hhbm5lbCkgfHwge30pIDoge307XG5cbiAgICAgIGNvbnN0IHN0YXJ0RmllbGQgPSB2Z0ZpZWxkKGZpZWxkRGVmLCB7ZXhwcjogJ2RhdHVtJyx9KTtcbiAgICAgIGNvbnN0IGVuZEZpZWxkID0gdmdGaWVsZChmaWVsZERlZiwge2V4cHI6ICdkYXR1bScsIGJpblN1ZmZpeDogJ2VuZCd9KTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZm9ybXVsYUFzOiB2Z0ZpZWxkKGZpZWxkRGVmLCB7YmluU3VmZml4OiAncmFuZ2UnfSksXG4gICAgICAgIGZvcm11bGE6IGJpbkZvcm1hdEV4cHJlc3Npb24oc3RhcnRGaWVsZCwgZW5kRmllbGQsIGd1aWRlLmZvcm1hdCwgY29uZmlnKVxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHt9O1xufVxuXG5mdW5jdGlvbiBiaW5LZXkoYmluOiBCaW5QYXJhbXMsIGZpZWxkOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGAke2JpblRvU3RyaW5nKGJpbil9XyR7ZmllbGR9YDtcbn1cblxuZnVuY3Rpb24gZ2V0U2lnbmFsc0Zyb21Nb2RlbChtb2RlbDogTW9kZWwsIGtleTogc3RyaW5nKSB7XG4gIHJldHVybiB7XG4gICAgc2lnbmFsOiBtb2RlbC5nZXROYW1lKGAke2tleX1fYmluc2ApLFxuICAgIGV4dGVudFNpZ25hbDogbW9kZWwuZ2V0TmFtZShgJHtrZXl9X2V4dGVudGApXG4gIH07XG59XG5cbmZ1bmN0aW9uIGlzQmluVHJhbnNmb3JtKHQ6IEZpZWxkRGVmPHN0cmluZz4gfCBCaW5UcmFuc2Zvcm0pOiB0IGlzIEJpblRyYW5zZm9ybSB7XG4gIHJldHVybiAnYXMnIGluIHQ7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJpbkNvbXBvbmVudCh0OiBGaWVsZERlZjxzdHJpbmc+IHwgQmluVHJhbnNmb3JtLCBtb2RlbDogTW9kZWwpIHtcbiAgbGV0IGFzOiBbc3RyaW5nLCBzdHJpbmddO1xuXG4gIGlmIChpc0JpblRyYW5zZm9ybSh0KSkge1xuICAgIGFzID0gW3QuYXMsIGAke3QuYXN9X2VuZGBdO1xuICB9IGVsc2Uge1xuICAgIGFzID0gW3ZnRmllbGQodCwge30pLCB2Z0ZpZWxkKHQsIHtiaW5TdWZmaXg6ICdlbmQnfSldO1xuICB9XG5cbiAgY29uc3QgYmluID0gbm9ybWFsaXplQmluKHQuYmluLCB1bmRlZmluZWQpIHx8IHt9O1xuICBjb25zdCBrZXkgPSBiaW5LZXkoYmluLCB0LmZpZWxkKTtcbiAgY29uc3Qge3NpZ25hbCwgZXh0ZW50U2lnbmFsfSA9IGdldFNpZ25hbHNGcm9tTW9kZWwobW9kZWwsIGtleSk7XG5cbiAgY29uc3QgYmluQ29tcG9uZW50OiBCaW5Db21wb25lbnQgPSB7XG4gICAgYmluOiBiaW4sXG4gICAgZmllbGQ6IHQuZmllbGQsXG4gICAgYXM6IGFzLFxuICAgIC4uLnNpZ25hbCA/IHtzaWduYWx9IDoge30sXG4gICAgLi4uZXh0ZW50U2lnbmFsID8ge2V4dGVudFNpZ25hbH0gOiB7fVxuICB9O1xuXG4gIHJldHVybiB7a2V5LCBiaW5Db21wb25lbnR9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJpbkNvbXBvbmVudCB7XG4gIGJpbjogQmluUGFyYW1zO1xuICBmaWVsZDogc3RyaW5nO1xuICBleHRlbnRTaWduYWw/OiBzdHJpbmc7XG4gIHNpZ25hbD86IHN0cmluZztcbiAgYXM6IHN0cmluZ1tdO1xuXG4gIC8vIFJhbmdlIEZvcm11bGFcblxuICBmb3JtdWxhPzogc3RyaW5nO1xuICBmb3JtdWxhQXM/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBCaW5Ob2RlIGV4dGVuZHMgRGF0YUZsb3dOb2RlIHtcbiAgcHVibGljIGNsb25lKCkge1xuICAgIHJldHVybiBuZXcgQmluTm9kZShudWxsLCBkdXBsaWNhdGUodGhpcy5iaW5zKSk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihwYXJlbnQ6IERhdGFGbG93Tm9kZSwgcHJpdmF0ZSBiaW5zOiBEaWN0PEJpbkNvbXBvbmVudD4pIHtcbiAgICBzdXBlcihwYXJlbnQpO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBtYWtlRnJvbUVuY29kaW5nKHBhcmVudDogRGF0YUZsb3dOb2RlLCBtb2RlbDogTW9kZWxXaXRoRmllbGQpIHtcbiAgICBjb25zdCBiaW5zID0gbW9kZWwucmVkdWNlRmllbGREZWYoKGJpbkNvbXBvbmVudEluZGV4OiBEaWN0PEJpbkNvbXBvbmVudD4sIGZpZWxkRGVmLCBjaGFubmVsKSA9PiB7XG4gICAgICBpZiAoZmllbGREZWYuYmluKSB7XG4gICAgICAgIGNvbnN0IHtrZXksIGJpbkNvbXBvbmVudH0gPSBjcmVhdGVCaW5Db21wb25lbnQoZmllbGREZWYsIG1vZGVsKTtcbiAgICAgICAgYmluQ29tcG9uZW50SW5kZXhba2V5XSA9IHtcbiAgICAgICAgICAuLi5iaW5Db21wb25lbnQsXG4gICAgICAgICAgLi4uYmluQ29tcG9uZW50SW5kZXhba2V5XSxcbiAgICAgICAgICAuLi5yYW5nZUZvcm11bGEobW9kZWwsIGZpZWxkRGVmLCBjaGFubmVsLCBtb2RlbC5jb25maWcpXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gYmluQ29tcG9uZW50SW5kZXg7XG4gICAgfSwge30pO1xuXG4gICAgaWYgKGtleXMoYmlucykubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IEJpbk5vZGUocGFyZW50LCBiaW5zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgYmluIG5vZGUgZnJvbSBCaW5UcmFuc2Zvcm0uXG4gICAqIFRoZSBvcHRpb25hbCBwYXJhbWV0ZXIgc2hvdWxkIHByb3ZpZGVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbWFrZUZyb21UcmFuc2Zvcm0ocGFyZW50OiBEYXRhRmxvd05vZGUsIHQ6IEJpblRyYW5zZm9ybSwgbW9kZWw6IE1vZGVsKSB7XG4gICAgY29uc3Qge2tleSwgYmluQ29tcG9uZW50fSA9IGNyZWF0ZUJpbkNvbXBvbmVudCh0LCBtb2RlbCk7XG4gICAgcmV0dXJuIG5ldyBCaW5Ob2RlKHBhcmVudCwge1xuICAgICAgW2tleV06IGJpbkNvbXBvbmVudFxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG1lcmdlKG90aGVyOiBCaW5Ob2RlKSB7XG4gICAgdGhpcy5iaW5zID0gey4uLnRoaXMuYmlucywgLi4ub3RoZXIuYmluc307XG4gICAgb3RoZXIucmVtb3ZlKCk7XG4gIH1cblxuICBwdWJsaWMgcHJvZHVjZWRGaWVsZHMoKSB7XG4gICAgY29uc3Qgb3V0ID0ge307XG5cbiAgICB2YWxzKHRoaXMuYmlucykuZm9yRWFjaChjID0+IHtcbiAgICAgIGMuYXMuZm9yRWFjaChmID0+IG91dFtmXSA9IHRydWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIHB1YmxpYyBkZXBlbmRlbnRGaWVsZHMoKSB7XG4gICAgY29uc3Qgb3V0ID0ge307XG5cbiAgICB2YWxzKHRoaXMuYmlucykuZm9yRWFjaChjID0+IHtcbiAgICAgIG91dFtjLmZpZWxkXSA9IHRydWU7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgcHVibGljIGFzc2VtYmxlKCk6IFZnVHJhbnNmb3JtW10ge1xuICAgIHJldHVybiBmbGF0dGVuKHZhbHModGhpcy5iaW5zKS5tYXAoYmluID0+IHtcbiAgICAgIGNvbnN0IHRyYW5zZm9ybTogVmdUcmFuc2Zvcm1bXSA9IFtdO1xuXG4gICAgICBjb25zdCBiaW5UcmFuczogVmdCaW5UcmFuc2Zvcm0gPSB7XG4gICAgICAgICAgdHlwZTogJ2JpbicsXG4gICAgICAgICAgZmllbGQ6IGJpbi5maWVsZCxcbiAgICAgICAgICBhczogYmluLmFzLFxuICAgICAgICAgIHNpZ25hbDogYmluLnNpZ25hbCxcbiAgICAgICAgICAuLi5iaW4uYmluXG4gICAgICB9O1xuXG4gICAgICBpZiAoIWJpbi5iaW4uZXh0ZW50ICYmIGJpbi5leHRlbnRTaWduYWwpIHtcbiAgICAgICAgdHJhbnNmb3JtLnB1c2goe1xuICAgICAgICAgIHR5cGU6ICdleHRlbnQnLFxuICAgICAgICAgIGZpZWxkOiBiaW4uZmllbGQsXG4gICAgICAgICAgc2lnbmFsOiBiaW4uZXh0ZW50U2lnbmFsXG4gICAgICAgIH0pO1xuICAgICAgICBiaW5UcmFucy5leHRlbnQgPSB7c2lnbmFsOiBiaW4uZXh0ZW50U2lnbmFsfTtcbiAgICAgIH1cblxuICAgICAgdHJhbnNmb3JtLnB1c2goYmluVHJhbnMpO1xuXG4gICAgICBpZiAoYmluLmZvcm11bGEpIHtcbiAgICAgICAgdHJhbnNmb3JtLnB1c2goe1xuICAgICAgICAgIHR5cGU6ICdmb3JtdWxhJyxcbiAgICAgICAgICBleHByOiBiaW4uZm9ybXVsYSxcbiAgICAgICAgICBhczogYmluLmZvcm11bGFBc1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRyYW5zZm9ybTtcbiAgICB9KSk7XG4gIH1cbn1cbiJdfQ==