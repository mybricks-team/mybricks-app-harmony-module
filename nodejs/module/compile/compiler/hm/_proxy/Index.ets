import { appRouter } from "../utils"
import {
  mybricks_harmony__showToast as basicMyBricksHarmony_showToast,
  mybricks_harmony__connector as basicMyBricksHarmony_connector,
  mybricks_harmony__connectorGlobalHeaders as basicMyBricksHarmony_connectorGlobalHeaders,
  mybricks_harmony__router as basicMyBricksHarmony_router,
  mybricks_harmony__aesEncode as basicMyBricksHarmony_aesEncode,
  mybricks_harmony__callPhone as basicMyBricksHarmony_callPhone,
  mybricks_harmony__vibrate as basicMyBricksHarmony_vibrate,
  mybricks_harmony_popup as BasicMyBricksHarmonyPopup,
  mybricks_harmony_popup_Data,
  mybricks_harmony_systemPage as BasicMyBricksHarmonySystemPage,
  mybricks_harmony_systemPage_Data,
  mybricks_harmony_systemWebview as BasicMyBricksHarmonySystemWebview,
  mybricks_Harmony_SystemWebview_Data,
  mybricks_harmony_button as BasicMyBricksHarmonyButton,
  mybricks_harmony_button_Data,
  mybricks_harmony_text as BasicMyBricksHarmonyText,
  mybricks_harmony_text_Data,
  mybricks_harmony_image as BasicMyBricksHarmonyImage,
  mybricks_harmony_image_Data,
  mybricks_harmony_video as BasicMyBricksHarmonyVideo,
  mybricks_harmony_video_Data,
  mybricks_harmony_richText as BasicMyBricksHarmonyRichText,
  mybricks_harmony_richText_Data,
  mybricks_harmony_tabs as BasicMyBricksHarmonyTabs,
  mybricks_harmony_tabs_Data,
  mybricks_harmony_swiper as BasicMyBricksHarmonySwiper,
  mybricks_harmony_swiper_Data,
  mybricks_harmony_sidebar as BasicMyBricksHarmonySidebar,
  mybricks_harmony_sidebar_Data,
  mybricks_harmony_containerList as BasicMyBricksHarmonyContainerList,
  mybricks_harmony_containerList_Data,
  mybricks_harmony_containerCondition as BasicMyBricksHarmonyContainerCondition,
  mybricks_harmony_containerCondition_Data,
  mybricks_harmony_containerBasic as BasicMyBricksHarmonyContainerBasic,
  mybricks_harmony_containerBasic_Data,
  mybricks_harmony_formInput as BasicMyBricksHarmonyFormInput,
  mybricks_harmony_formInput_Data,
  mybricks_harmony_formTextarea as BasicMyBricksHarmonyFormTextarea,
  mybricks_harmony_formTextarea_Data,
  mybricks_harmony_formPassword as BasicMyBricksHarmonyFormPassword,
  mybricks_harmony_formPassword_Data,
  mybricks_harmony_formSwitch as BasicMyBricksHarmonyFormSwitch,
  mybricks_harmony_formSwitch_Data,
  mybricks_harmony_formRadio as BasicMyBricksHarmonyFormRadio,
  mybricks_harmony_formRadio_Data,
  mybricks_harmony_smsInput as BasicMyBricksHarmonySmsInput,
  mybricks_harmony_smsInput_Data,
  mybricks_harmony_formCheckbox as BasicMyBricksHarmonyFormCheckbox,
  mybricks_harmony_formCheckbox_Data,
  mybricks_harmony_formSelect as BasicMyBricksHarmonyFormSelect,
  mybricks_harmony_formSelect_Data,
  mybricks_harmony_line as BasicMyBricksHarmonyLine,
  mybricks_harmony_line_Data,
  mybricks_harmony_formImageUploader as BasicMyBricksHarmonyFormImageUploader,
  mybricks_harmony_formImageUploader_Data,
  mybricks_harmony_formFileUploader as BasicMyBricksHarmonyFormFileUploader,
  mybricks_harmony_formFileUploader_Data,
  mybricks_harmony_searchBar as BasicMyBricksHarmonySearchBar,
  mybricks_harmony_searchBar_Data,
  mybricks_harmony_support as BasicMyBricksHarmonySupport,
  mybricks_harmony_support_Data,
  mybricks_harmony_qrcode as BasicMyBricksHarmonyQrcode,
  mybricks_harmony_qrcode_Data,
  mybricks_harmony_containerWaterfall as BasicMyBricksHarmonyContainerWaterfall,
  mybricks_harmony_containerWaterfall_Data

} from "../comlib/Index"
import basicCodes from "./codes";
import { createJSHandle, createInputsHandle, createEventsHandle, Page, createVariable, createVars, createFx } from "../utils/mybricks"
import { genCallConnector } from "../utils/CallConnector"
import { MyBricks } from "../utils/types"
import { globalVars, globalFxs } from "./global"

type Style = Record<string, string | number>;
type Styles = Record<string, Style>;

class MyBricksColumnModifier implements AttributeModifier<ColumnAttribute> {
  style: Style;

  constructor(style: Style) {
    this.style = style;
  }

  applyNormalAttribute(instance: ColumnAttribute): void {
    const style = this.style;
    // width
    instance.width(style.width);
    // height
    instance.height(style.height);
    // marginTop
    // marginBottom
    // marginLeft
    // marginRight
    instance.margin({
      top: style.marginTop,
      right: style.marginRight,
      bottom: style.marginBottom,
      left: style.marginLeft
    })
    // paddingTop
    // paddingRight
    // paddingBottom
    // paddingLeft
    instance.padding({
      top: style.paddingTop,
      right: style.paddingRight,
      bottom: style.paddingBottom,
      left: style.paddingLeft
    })
    // flex
    if (typeof style.flex === "number") {
      instance.flexGrow(style.flex as number)
      instance.flexShrink(1)
      instance.flexBasis("0%")
    } else {
      instance.flexShrink(0)
    }
    // position
    if (["absolute", "fixed"].includes(style.position as string)) {
      instance.position({
        top: style.top as number,
        left: style.left as number,
        right: style.right as number,
        bottom: style.bottom as number,
      })
    }
  }
}

@Builder function Slot(params: MyBricks.SlotParams) {}

const _env: MyBricks._Env = {
  currentScenes: {
    close: () => {
      appRouter.pop()
    }
  }
}

const vars: ESObject = createVars(globalVars)

const env: MyBricks.Env = {
  callConnector: genCallConnector(basicCodes, { domain: undefined}, { globalVars: vars }),
  appRouter,
  globalVars: vars
}

export const Controller = () => {
  return createInputsHandle({}, true) as MyBricks.Controller
}

/** 场景打开、输出 */
export const page = new Page(appRouter);

/** _showToast */
export const myBricksHarmony_showToast = (props: MyBricks.JSParams): (...values: MyBricks.EventValue) => Record<string, MyBricks.EventValue> => {
  return createJSHandle(basicMyBricksHarmony_showToast, { props });
}

/** connector */
export const myBricksHarmony_connector = (props: MyBricks.JSParams): (...values: MyBricks.EventValue) => Record<string, MyBricks.EventValue> => {
  return createJSHandle(basicMyBricksHarmony_connector, { props, env });
}

/** connectorGlobalHeaders */
export const myBricksHarmony_connectorGlobalHeaders = (props: MyBricks.JSParams): (...values: MyBricks.EventValue) => Record<string, MyBricks.EventValue> => {
  return createJSHandle(basicMyBricksHarmony_connectorGlobalHeaders, { props, env });
}

/** router */
export const myBricksHarmony_router = (props: MyBricks.JSParams): (...values: MyBricks.EventValue) => Record<string, MyBricks.EventValue> => {
  return createJSHandle(basicMyBricksHarmony_router, { props, env });
}

/** aesEncode */
export const myBricksHarmony_aesEncode = (props: MyBricks.JSParams): (...values: MyBricks.EventValue) => Record<string, MyBricks.EventValue> => {
  return createJSHandle(basicMyBricksHarmony_aesEncode, { props, env });
}

/** callPhone */
export const myBricksHarmony_callPhone = (props: MyBricks.JSParams): (...values: MyBricks.EventValue) => Record<string, MyBricks.EventValue> => {
  return createJSHandle(basicMyBricksHarmony_callPhone, { props, env });
}

/** vibrate */
export const myBricksHarmony_vibrate = (props: MyBricks.JSParams): (...values: MyBricks.EventValue) => Record<string, MyBricks.EventValue> => {
  return createJSHandle(basicMyBricksHarmony_vibrate, { props, env });
}

/** systemPage */
@ComponentV2
export struct MyBricksHarmonySystemPage {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonySystemPage({
        data: new mybricks_harmony_systemPage_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
        slots: this.slots,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}


/** popup */
@ComponentV2
export struct MyBricksHarmonyPopup {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyPopup({
        _env,
        data: new mybricks_harmony_popup_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
        slots: this.slots,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}


/** systemWebview */
@ComponentV2
export struct MyBricksHarmonySystemWebview {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonySystemWebview({
        data: new mybricks_Harmony_SystemWebview_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)

  }
}


/** button */
@ComponentV2
export struct MyBricksHarmonyButton {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyButton({
        data: new mybricks_harmony_button_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)

  }
}


/** text */
@ComponentV2
export struct MyBricksHarmonyText {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyText({
        data: new mybricks_harmony_text_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)

  }
}


/** image */
@ComponentV2
export struct MyBricksHarmonyImage {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyImage({
        data: new mybricks_harmony_image_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)

  }
}

/** video */
@ComponentV2
export struct MyBricksHarmonyVideo {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyVideo({
        data: new mybricks_harmony_video_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)

  }
}

/** richText */
@ComponentV2
export struct MyBricksHarmonyRichText {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyRichText({
        data: new mybricks_harmony_richText_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)

  }
}

/** tabs */
@ComponentV2
export struct MyBricksHarmonyTabs {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyTabs({
        data: new mybricks_harmony_tabs_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
        slots: this.slots,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}

/** swiper */
@ComponentV2
export struct MyBricksHarmonySwiper {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonySwiper({
        data: new mybricks_harmony_swiper_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}

/** sidebar */
@ComponentV2
export struct MyBricksHarmonySidebar {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonySidebar({
        data: new mybricks_harmony_sidebar_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
        slots: this.slots,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}

/** containerList */
@ComponentV2
export struct MyBricksHarmonyContainerList {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyContainerList({
        data: new mybricks_harmony_containerList_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
        slots: this.slots,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}


/** ContainerWaterfall */
@ComponentV2
export struct MyBricksHarmonyContainerWaterfall {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyContainerWaterfall({
        data: new mybricks_harmony_containerWaterfall_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
        slots: this.slots,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}


/** containerBasic */
@ComponentV2
export struct MyBricksHarmonyContainerBasic {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyContainerBasic({
        data: new mybricks_harmony_containerBasic_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
        slots: this.slots,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}

/** containerCondition */
@ComponentV2
export struct MyBricksHarmonyContainerCondition {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyContainerCondition({
        data: new mybricks_harmony_containerCondition_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
        slots: this.slots,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}


/** containerRow */
@ComponentV2
export struct MyBricksHarmonyContainerRow {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyContainerBasic({
        data: new mybricks_harmony_containerBasic_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
        slots: this.slots,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}

/** formInput */
@ComponentV2
export struct MyBricksHarmonyFormInput {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyFormInput({
        data: new mybricks_harmony_formInput_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}

/** formTextarea */
@ComponentV2
export struct MyBricksHarmonyFormTextarea {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyFormTextarea({
        data: new mybricks_harmony_formTextarea_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}

/** formPassword */
@ComponentV2
export struct MyBricksHarmonyFormPassword {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyFormPassword({
        data: new mybricks_harmony_formPassword_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}

/** formRadio */
@ComponentV2
export struct MyBricksHarmonyFormRadio {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyFormRadio({
        data: new mybricks_harmony_formRadio_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}

/** FormCheckbox */
@ComponentV2
export struct MyBricksHarmonyFormCheckbox {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyFormCheckbox({
        data: new mybricks_harmony_formCheckbox_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}

/** formSwitch */
@ComponentV2
export struct MyBricksHarmonyFormSwitch {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyFormSwitch({
        data: new mybricks_harmony_formSwitch_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}

/** smsInput */
@ComponentV2
export struct MyBricksHarmonySmsInput {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonySmsInput({
        data: new mybricks_harmony_smsInput_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}


/** FormSelect */
@ComponentV2
export struct MyBricksHarmonyFormSelect {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyFormSelect({
        data: new mybricks_harmony_formSelect_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}


/** Line */
@ComponentV2
export struct MyBricksHarmonyLine {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyLine({
        data: new mybricks_harmony_line_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}


/** searchBar */
@ComponentV2
export struct MyBricksHarmonySearchBar {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonySearchBar({
        data: new mybricks_harmony_searchBar_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}

/** qrcode */
@ComponentV2
export struct MyBricksHarmonyQrcode {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyQrcode({
        data: new mybricks_harmony_qrcode_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}

/** support */
@ComponentV2
export struct MyBricksHarmonySupport{
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonySupport({
        data: new mybricks_harmony_support_Data(this.data as MyBricks.Any),
        styles: this.styles,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}


/** FormImageUploader */
@ComponentV2
export struct MyBricksHarmonyFormImageUploader {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyFormImageUploader({
        data: new mybricks_harmony_formImageUploader_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
        slots: this.slots,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}

/** FormFileUploader */
@ComponentV2
export struct MyBricksHarmonyFormFileUploader {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyFormFileUploader({
        data: new mybricks_harmony_formFileUploader_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
        slots: this.slots,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}

/** JS计算 */
const codes: MyBricks.Codes = Object.keys(basicCodes).reduce((pre, key) => {
  pre[key] = (props: MyBricks.JSParams): MyBricks.JSReturn => {
    return createJSHandle(basicCodes[key], { props });
  }
  return pre
}, {} as MyBricks.Codes)

export {
  codes,
  globalFxs,
  globalVars,
  createVariable,
  createFx
}