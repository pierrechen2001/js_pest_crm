import * as ReactDOM from 'react-dom';

// 为 React-DOM 添加 findDOMNode 兼容处理
if (!ReactDOM.findDOMNode && ReactDOM.default) {
  ReactDOM.findDOMNode = ReactDOM.default.findDOMNode;
}

export default ReactDOM;