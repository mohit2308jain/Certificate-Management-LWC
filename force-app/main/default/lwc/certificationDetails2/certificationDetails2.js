import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord, getRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import getCertificationList from '@salesforce/apex/CertificationController.getCertificationList';

import Certification_Object from '@salesforce/schema/Certification__c';
import CertificateRecId from '@salesforce/schema/Certification__c.Id';
import CertificateName from '@salesforce/schema/Certification__c.Name';
import CertificateCost from '@salesforce/schema/Certification__c.Cost__c';
import CertificateComments from '@salesforce/schema/Certification__c.Comments__c';

const COLS = [
    { label: 'Certification Id', fieldName: 'Cert_Id__c' },
    { label: 'Name', fieldName: 'Name', type: 'text' },
    { label: 'Cost', fieldName: 'Cost__c', type: 'number', cellAttributes: { alignment: 'left' } },
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

export default class CertificationDetails extends LightningElement {

    @track bShowModal = false;
    @track record = {};
    @track error;
    @track columns = COLS;
    selected = [];

    @track recId;
    @wire(getCertificationList)
    certification;


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