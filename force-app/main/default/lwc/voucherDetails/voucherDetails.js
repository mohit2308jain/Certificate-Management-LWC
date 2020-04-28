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
    { label: 'Name', fieldName: 'Name', type: 'text', editable: true },
    { label: 'Cost', fieldName: 'Cost__c', type: 'number', cellAttributes: { alignment: 'left' } },
    //{ label: 'Certification', fieldName: 'Certification__c'},
    { label: 'Validity', fieldName: 'Validity__c', type: 'date'},
    { label: 'Active', fieldName: 'Active__c', type: 'boolean', editable: true},
    { label: 'Comments', fieldName: 'Comments__c', type: 'text', editable: true },
    { label: 'View', type: 'button-icon', initialWidth: 75,
        typeAttributes: {
            label: 'Show',
            name: 'showRec',
            iconName: 'action:preview',
            title: 'Preview',
            variant: 'border-filled',
            alternativeText: 'View'
        }
    },
    { label: 'Delete', type: 'button-icon', initialWidth: 75,
        typeAttributes: {
            label: 'remove',
            name: 'delRec',
            iconName: 'action:delete',
            title: 'Delete',
            variant: 'border-filled',
            alternativeText: 'View'
        }
    }
];

export default class VoucherDetails extends LightningElement {
    name_field = VoucherName;
    //cost_field = VoucherCost;
    validity_field = VoucherValidity;
    active_field = VoucherActive;
    certification_field = VouherCertification;
    comments_field = VoucherComments;

    createVoucher = (event) => {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message: 'Voucher Created !',
            variant: 'success'
        }));
        location.reload();
    }

    clear = (event) => {
        this.template.querySelector('form').reset();
    }


    @track bShowModal = false;
    @track record = {};
    @track error;
    @track columns = COLS;
    @track draftValues = [];
    selected = [];

    
    recId = '';
    @wire(getVoucherList)
    vouchers;

    handleRowAction(event) {

        const row = event.detail.row;

        console.log(JSON.stringify(event.detail.action));
        if(event.detail.action.label==='Show') {
            console.log('clicked View button');
            this.record = row;
            this.openModal();
        } else if (event.detail.action.label==='remove') {
            console.log('clicked Delete button');
            this.deleteVouchers(row);
        }

        
    }

    openModal() {  
        this.bShowModal = true;
    }
 
    closeModal() {    
        this.bShowModal = false;
    }


    handleSave = (event) =>  {

        let fields = {};

        const len = event.detail.draftValues.length;

        for(let i=0;i<len;i++){
            fields = {};

            fields[VoucherRecId.fieldApiName] = event.detail.draftValues[i].Id;
            fields[VoucherName.fieldApiName] = event.detail.draftValues[i].Name;
            fields[VoucherActive.fieldApiName] = event.detail.draftValues[i].Active__c;
            fields[VoucherComments.fieldApiName] = event.detail.draftValues[i].Comments__c;
            console.log(fields);
            
            if(i==(len-1)){
                updateRecord({fields})
                .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Voucher updated',
                            variant: 'Success'
                        })
                    );

                    this.draftValues = [];
                    location.reload();
                    //return refreshApex(this.certification);
                }).catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent ({
                            title: 'Error creating record',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                });
            }
            else{
                updateRecord({fields})
            }   
        }
    }

    deleteVouchers = (currRow) => {


        deleteRecord(currRow.Id)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record deleted',
                        variant: 'success'
                    })
                );
                
                return refreshApex(this.vouchers);
                location.reload();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting record',
                        message: 'kkkkk',
                        variant: 'error'
                    })
                );
            });
            

        console.log('delete');
    }

}