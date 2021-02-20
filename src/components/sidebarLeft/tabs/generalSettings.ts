import { SliderSuperTab } from "../../slider"
import { AppSidebarLeft, generateSection } from "..";
import RangeSelector from "../../rangeSelector";
import { clamp } from "../../../helpers/number";
import Button from "../../button";
import CheckboxField from "../../checkbox";
import RadioField from "../../radioField";
import appStateManager from "../../../lib/appManagers/appStateManager";
import rootScope from "../../../lib/rootScope";
import { isApple } from "../../../helpers/userAgent";
import Row from "../../row";
import { attachClickEvent } from "../../../helpers/dom";
import AppBackgroundTab from "./background";

export class RangeSettingSelector {
  public container: HTMLDivElement;
  private range: RangeSelector;

  public onChange: (value: number) => void;

  constructor(name: string, step: number, initialValue: number, minValue: number, maxValue: number) {
    const BASE_CLASS = 'range-setting-selector';
    this.container = document.createElement('div');
    this.container.classList.add(BASE_CLASS);

    const details = document.createElement('div');
    details.classList.add(BASE_CLASS + '-details');

    const nameDiv = document.createElement('div');
    nameDiv.classList.add(BASE_CLASS + '-name');
    nameDiv.innerHTML = name;

    const valueDiv = document.createElement('div');
    valueDiv.classList.add(BASE_CLASS + '-value');
    valueDiv.innerHTML = '' + initialValue;

    details.append(nameDiv, valueDiv);

    this.range = new RangeSelector(step, initialValue, minValue, maxValue);
    this.range.setListeners();
    this.range.setHandlers({
      onScrub: value => {
        if(this.onChange) {
          this.onChange(value);
        }

        //console.log('font size scrub:', value);
        valueDiv.innerText = '' + value;
      }
    });

    this.container.append(details, this.range.container);
  }
}

export default class AppGeneralSettingsTab extends SliderSuperTab {
  constructor(appSidebarLeft: AppSidebarLeft) {
    super(appSidebarLeft, true);
  }

  init() {
    this.container.classList.add('general-settings-container');
    this.title.innerText = 'General';

    const section = generateSection.bind(null, this.scrollable);

    {
      const container = section('Settings');
      
      const range = new RangeSettingSelector('Message Text Size', 1, rootScope.settings.messagesTextSize, 12, 20);
      range.onChange = (value) => {
        appStateManager.setByKey('settings.messagesTextSize', value);
      };

      const chatBackgroundButton = Button('btn-primary btn-transparent', {icon: 'photo', text: 'Chat Background'});

      attachClickEvent(chatBackgroundButton, () => {
        new AppBackgroundTab(this.slider).open();
      });

      const animationsCheckboxField = CheckboxField({
        text: 'Enable Animations', 
        name: 'animations', 
        stateKey: 'settings.animationsEnabled'
      });
      
      container.append(range.container, chatBackgroundButton, animationsCheckboxField.label);
    }

    {
      const container = section('Keyboard');

      const form = document.createElement('form');

      const enterRow = new Row({
        radioField: RadioField('Send by Enter', 'send-shortcut', 'enter', 'settings.sendShortcut'),
        subtitle: 'New line by Shift + Enter',
      });

      const ctrlEnterRow = new Row({
        radioField: RadioField(`Send by ${isApple ? '⌘' : 'Ctrl'} + Enter`, 'send-shortcut', 'ctrlEnter', 'settings.sendShortcut'),
        subtitle: 'New line by Enter',
      });
      
      form.append(enterRow.container, ctrlEnterRow.container);
      container.append(form);
    }

    {
      const container = section('Auto-Download Media');
      container.classList.add('sidebar-left-section-disabled');

      const contactsCheckboxField = CheckboxField({
        text: 'Contacts', 
        name: 'contacts',
        stateKey: 'settings.autoDownload.contacts'
      });
      const privateCheckboxField = CheckboxField({
        text: 'Private Chats', 
        name: 'private',
        stateKey: 'settings.autoDownload.private'
      });
      const groupsCheckboxField = CheckboxField({
        text: 'Group Chats', 
        name: 'groups',
        stateKey: 'settings.autoDownload.groups'
      });
      const channelsCheckboxField = CheckboxField({
        text: 'Channels', 
        name: 'channels',
        stateKey: 'settings.autoDownload.channels'
      });

      container.append(contactsCheckboxField.label, privateCheckboxField.label, groupsCheckboxField.label, channelsCheckboxField.label);
    }

    {
      const container = section('Auto-Play Media');
      container.classList.add('sidebar-left-section-disabled');

      const gifsCheckboxField = CheckboxField({
        text: 'GIFs', 
        name: 'gifs', 
        stateKey: 'settings.autoPlay.gifs'
      });
      const videosCheckboxField = CheckboxField({
        text: 'Videos', 
        name: 'videos', 
        stateKey: 'settings.autoPlay.videos'
      });

      container.append(gifsCheckboxField.label, videosCheckboxField.label);
    }
    
    {
      const container = section('Stickers');

      const suggestCheckboxField = CheckboxField({
        text: 'Suggest Stickers by Emoji', 
        name: 'suggest', 
        stateKey: 'settings.stickers.suggest'
      });
      const loopCheckboxField = CheckboxField({
        text: 'Loop Animated Stickers', 
        name: 'loop', 
        stateKey: 'settings.stickers.loop'
      });

      container.append(suggestCheckboxField.label, loopCheckboxField.label);
    }
  }

  onOpen() {
    if(this.init) {
      this.init();
      this.init = null;
    }
  }
}