"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.testEmptyHeaderAfter = exports.testEmptyHeaderBefore = exports.testMetadataStructure = void 0;
var testMetadataStructure = [{
  type: 'div',
  label: 'Title',
  id: '123a-456b-789c-0d',
  items: [{
    type: 'div',
    label: 'First segment',
    id: '123a-456b-789c-1d',
    items: [{
      type: 'div',
      label: 'Sub-Segment 1.1',
      id: '123a-456b-789c-2d',
      items: []
    }, {
      type: 'span',
      label: 'Segment 1.1',
      id: '123a-456b-789c-3d',
      begin: '00:00:03.32',
      end: '00:00:10.32'
    }, {
      type: 'span',
      label: 'Segment 1.2',
      id: '123a-456b-789c-4d',
      begin: '00:00:11.23',
      end: '00:08:00.00'
    }]
  }, {
    type: 'div',
    label: 'Second segment',
    id: '123a-456b-789c-5d',
    items: [{
      type: 'div',
      label: 'Sub-Segment 2.1',
      id: '123a-456b-789c-6d',
      items: [{
        type: 'div',
        label: 'Sub-Segment 2.1.1',
        id: '123a-456b-789c-7d',
        items: []
      }, {
        type: 'span',
        label: 'Segment 2.1',
        id: '123a-456b-789c-8d',
        begin: '00:09:03.24',
        end: '00:15:00.00'
      }]
    }]
  }]
}];
exports.testMetadataStructure = testMetadataStructure;
var testEmptyHeaderBefore = [{
  type: 'div',
  label: 'Title',
  id: '123a-456b-789c-0d',
  items: [{
    type: 'div',
    label: 'Scene 1',
    id: '123a-456b-789c-1d',
    items: []
  }, {
    type: 'div',
    label: 'Scene 2',
    id: '123a-456b-789c-2d',
    items: [{
      type: 'span',
      label: 'Act 1',
      id: '123a-456b-789c-3d',
      begin: '00:10:00.00',
      end: '00:15:00.00'
    }]
  }]
}];
exports.testEmptyHeaderBefore = testEmptyHeaderBefore;
var testEmptyHeaderAfter = [{
  type: 'div',
  label: 'Title',
  id: '123a-456b-789c-0d',
  items: [{
    type: 'div',
    label: 'Scene 1',
    id: '123a-456b-789c-1d',
    items: [{
      type: 'span',
      label: 'Act 1',
      id: '123a-456b-789c-2d',
      begin: '00:00:00.00',
      end: '00:09:00.00'
    }]
  }, {
    type: 'div',
    label: 'Scene 2',
    id: '123a-456b-789c-3d',
    items: []
  }]
}];
exports.testEmptyHeaderAfter = testEmptyHeaderAfter;