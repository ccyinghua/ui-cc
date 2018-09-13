import Button from '../packages/button/index.js';
import ButtonGroup from '../packages/button-group/index.js';
import Tag from '../packages/tag/index.js';
import Row from '../packages/row/index.js';
import Col from '../packages/col/index.js';
import Progress from '../packages/progress/index.js';
import Card from '../packages/card/index.js';

const components = [
  Button,
  ButtonGroup,
  Tag,
  Row,
  Col,
  Progress,
  Card
];

const install = function(Vue, opts = {}) {
  components.map(component => Vue.component(component.name, component));
};

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default {
  version: '1.0.0',
  install,
  Button,
  ButtonGroup,  
  Tag,  
  Row,
  Col,
  Progress,
  Card
};