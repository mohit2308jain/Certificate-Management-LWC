import { LightningElement, wire, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord, getRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import getVoucherList from '@salesforce/apex/VoucherController.getVoucherList';
import getVoucher from '@salesforce/apex/VoucherController.getVoucher';

//Importing all neccessary fields from Voucher Object.
import Voucher_Object from '@salesforce/schema/Voucher__c';
import VoucherRecId from '@salesforce/schema/Voucher__c.Id';
import VoucherName from '@salesforce/schema/Voucher__c.Name';
import VoucherCost from '@salesforce/schema/Voucher__c.Cost__c';
import VoucherValidity from '@salesforce/schema/Voucher__c.Validity__c';
import VoucherActive from '@salesforce/schema/Voucher__c.Active__c';
import VouherCertification from '@salesforce/schema/Voucher__c.Certification__c';
import VoucherComments from '@salesforce/schema/Voucher__c.Comments__c';

//Columns defined to be shown on lightning datatable
const COLS = [
    { label: 'Voucher Id', fieldName: 'Voucher_Id__c' },
    { label: 'Name', fieldName: 'Name', type: 'text', editable: true },
    //{ label: 'Cost', fieldName: 'Cost__c', type: 'number', cellAttributes: { alignment: 'left' } },
    //{ label: 'Certification', fieldName: 'Certification__c'},
    { label: 'Validity', fieldName: 'Validity__c', type: 'date'},
    { label: 'Active', fieldName: 'Active__c', type: 'boolean', editable: true},
    { label: 'Comments', fieldName: 'Comments__c', type: 'text', editable: true },
    { label: 'View', type: 'button-icon', initialWidth: 75,
        typeAttributes: {
            label: 'Show',
            name: 'showRec',
            iconName: 'action:info',
            title: 'Info',
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
            alternativeText: 'Delete'
        }
    }
];

export default class VoucherDetails extends LightningElement {
    name_field = VoucherName;
    validity_field = VoucherValidity;
    active_field = VoucherActive;
    certification_field = VouherCertification;
    comments_field = VoucherComments;

    //Inserting record in the salesforce database
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


    @track showCreateForm = false;
    @track showList = true;
    @track bShowModal = false;
    @track record = {};
    @track error;
    @track columns = COLS;
    @track draftValues = [];

    //Using the apex method to fetch the list of records in Voucher Object
    @wire(getVoucherList)
    vouchers;

    //Function used to fetch records according to the value given as input in the searchbar
    searchRecords = (event)  => {

        const searchTerm = event.target.value; 
        
        if (searchTerm) {
            getVoucher( { searchTerm } ).then((result) => { 
                
                this.vouchers.data = result;
            }) 
            .catch(error => { 
                this.error = error; 
            }); 
        } else if(!searchTerm) 
        {
            getVoucherList()
            .then(result => {
                this.vouchers.data = result;
            })
            .catch(error => {
                this.error = error;
            })
        }
        else{
            this.vouchers = undefined; 
        }
    }

    //Functions to show create record form and the list of records on button clicks
    showFormView = (event) => {
        this.showCreateForm = true;
        this.showList = false;
    }
    showListView = (event) => {
        this.showList = true;
        this.showCreateForm = false;
    }

    //Function to handle the action when view and delete icons are pressed
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

    //Functions to open and close the view record modal.
    openModal() {  
        this.bShowModal = true;
    }
 
    closeModal() {    
        this.bShowModal = false;
    }

    //Function to update the records
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

    //Function to delete a particular record when that corresponding record's delete icon is pressed
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