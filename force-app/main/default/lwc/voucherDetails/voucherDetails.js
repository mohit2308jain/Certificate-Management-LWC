import { LightningElement, wire, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord, getRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import getVoucherList from '@salesforce/apex/VoucherController.getVoucherList';

import Certification_Object from '@salesforce/schema/Certification__c';
import CertificateName from '@salesforce/schema/Certification__c.Name';
import CertificateCost from '@salesforce/schema/Certification__c.Cost__c';
import Voucher_Object from '@salesforce/schema/Voucher__c';
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

/*
const FI = [
    'Certification__c.Name'
];
*/

export default class VoucherDetails extends LightningElement {
    name_field = VoucherName;
    //cost_field = VoucherCost;
    validity_field = VoucherValidity;
    active_field = VoucherActive;
    certification_field = VouherCertification;
    comments_field = VoucherComments;

    createVoucher = (event) => {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Voila',
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

        const recoredInputs = event.detail.draftValues.slice().map((draft) => {
            const fields = Object.assign({}, draft);
            return { fields };
        });

        const promises = recoredInputs.map((recordInput) => {
            updateRecord(recordInput)
        });

        Promise.all(promises).then((vou) => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Voucher updated',
                    variant: 'success'
                })
            );
            // Clear all draft values
            this.draftValues = [];

            // Display fresh data in the datatable
            //return refreshApex(this.vouchers);
            location.reload();
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating record',
                    message: event.body.message,
                    variant: 'error'
                })
            );
        });
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