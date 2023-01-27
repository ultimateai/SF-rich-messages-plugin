import { LightningElement, api, track } from 'lwc';

export default class Lwcchatpack_html extends LightningElement 
{
    @api inputParams;
    @api isHidden;
    @track innerHtml = '';

    connectedCallback() 
    {
        console.log(this.isHidden,'isHidden in html')
        if(this.isHidden) {
            console.log(this.inputParams,'this.inputParams')
            // this.innerHtml = this.inputParams.replace('&amp;&amp;hide&amp;&amp;', '')
        }
        this.innerHtml = this.inputParams;
        // this.innerHtml = this.inputParams.replace(/<a\shref=[\s\S]+target='_blank'>/g, '').replace(/<\/a>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x2F;/g, "/");

        // this.innerHtml = this.inputParams.replace(/<a\shref=[\s\S]+target='_blank'>/g, '').replace(/<\/a>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x2F;/g, "/");
    }
    


    postMessage(e)
    {
        this.dispatchEvent(new CustomEvent('postmessage',{
            detail: e
        }));
    }
}