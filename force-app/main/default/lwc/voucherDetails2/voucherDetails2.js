import { LightningElement, wire, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord, getRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import getVoucherList from '@salesforce/apex/VoucherController.getVoucherList';

import Voucher_Object from '@salesforce/schema/Voucher__c';
import VoucherRecId from '@salesforce/schema/Voucher__c.Id';
import VoucherName from '@salesforce/schema/Voucher__c.Name';
import VoucherCost from '@salesforce/schema/Voucher__c.Cost__c';
import VoucherValidity from '@salesforce/schema/Voucher__c.Validity__c';
import VoucherActive from '@salesforce/schema/Voucher__c.Active__c';
import VouherCertification from '@salesforce/schema/Voucher__c.Certification__c';
import VoucherComments from '@salesforce/schema/Voucher__c.Comments__c';

const COLS = [
    { label: 'Voucher Id', fieldName: 'Voucher_Id__c' },
    { label: 'Name', fieldName: 'Name', type: 'text'},
    { label: 'Cost', fieldName: 'Cost__c', type: 'number', cellAttributes: { alignment: 'left' } },
    { label: 'Validity', fieldName: 'Validity__c', type: 'date'},
    { label: 'Active', fieldName: 'Active__c', type: 'boolean'},
    { label: 'Comments', fieldName: 'Comments__c', type: 'text'},
    { label: 'View', type: 'button-icon', initialWidth: 75,
        typeAttributes: {
            label: 'Show',
            name: 'showRec',
            iconName: 'action:preview',
            title: 'Preview',
            variant: 'border-filled',
            alternativeText: 'View'
        }
    }
];

export default class VoucherDetails extends LightningElement {
    

    @track bShowModal = false;
    @track record = {};
    @track error;
    @track columns = COLS;
    @track draftValues = [];
    
    @wire(getVoucherList)
    vouchers;

    handleRowAction(event) {

        const row = event.detail.row;

        console.log(JSON.stringify(event.detail.action));
        if(event.detail.action.label==='Show') {
            console.log('clicked View button');
            this.record = row;
            this.openModal();
        }
    }

    openModal() {  
        this.bShowModal = true;
    }
 
    closeModal() {    
        this.bShowModal = false;
    }
}