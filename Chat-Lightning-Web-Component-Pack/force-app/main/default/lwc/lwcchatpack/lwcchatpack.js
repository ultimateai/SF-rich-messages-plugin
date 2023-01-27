import BaseChatMessage from 'lightningsnapin/baseChatMessage';
import { track } from 'lwc';

const CHAT_CONTENT_CLASS = 'chat-content rich-content-wrapper';
const CHAT_BOT_V4_CLASS = 'chat-bot-v4';
const AGENT_USER_TYPE = 'agent';
const CHASITOR_USER_TYPE = 'chasitor';
const SUPPORTED_USER_TYPES = [AGENT_USER_TYPE, CHASITOR_USER_TYPE];

const V1_KEY = '&amp;&amp;version1&amp;&amp;';
const V2_KEY = '&amp;&amp;version2&amp;&amp;';
const V3_KEY = '&amp;&amp;version3&amp;&amp;';
const V4_KEY = '&amp;&amp;version4&amp;&amp;';
const VERSIONS_LIST = [V1_KEY, V2_KEY, V3_KEY, V4_KEY];

export default class Lwcchatpack extends BaseChatMessage
{
    @track strMessage = '';
    @track showLoader = false;

    connectedCallback() 
    {
        this.strMessage = this.messageContent.value;
        const isSupported = this.isSupportedUserType(this.userType);
        if (isSupported) 
        {   
            this.showLoader = this.userType === AGENT_USER_TYPE;

            this.messageStyle = `${CHAT_CONTENT_CLASS} ${this.userType}`;
            
            VERSIONS_LIST.forEach((itemKey) => {
                if(this.strMessage.includes(itemKey)) {
                    this.strMessage = this.strMessage.replace(itemKey, '');
                    if (itemKey === V4_KEY) {
                        this.messageStyle = `${CHAT_CONTENT_CLASS} ${CHAT_BOT_V4_CLASS} ${this.userType}`;
                    }
                }
            })
            
            if(this.showLoader){
                this.messageStyle = `${this.messageStyle} has-loader` 
            }

            this.strMessage = this.strMessage.replace(/<a\shref=[\s\S]+target='_blank'>/g, '').replace(/<\/a>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x2F;/g, "/");

        } 
        else
        {
            throw new Error('Unsupported user type passed in: ${this.userType}');
        }
    }


    isSupportedUserType(userType) 
    {
        return SUPPORTED_USER_TYPES.some((supportedUserType) => supportedUserType === userType);
    }
}