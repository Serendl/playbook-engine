export default class CustomPalette {
  constructor(bpmnFactory, create, elementFactory, palette, translate) {
      this.bpmnFactory = bpmnFactory;
      this.create = create;
      this.elementFactory = elementFactory;
      this.translate = translate;

      palette.registerProvider(this);
  }
  // 这个函数就是绘制palette的核心
  getPaletteEntries(element) {}
}

CustomPalette.$inject = [
  'bpmnFactory',
  'create',
  'elementFactory',
  'palette',
  'translate'
]
