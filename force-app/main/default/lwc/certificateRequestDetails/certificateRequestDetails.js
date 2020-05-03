import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord, getRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import getRequestsList from '@salesforce/apex/RequestController.getRequestsList';
import getRequest from '@salesforce/apex/RequestController.getRequest';

import Certification_Request_Object from '@salesforce/schema/Certification_Request__c';
import CertificationReqStatus from '@salesforce/schema/Certification_Request__c.Status__c';
import CertificationReqDueDate from '@salesforce/schema/Certification_Request__c.Due_Date__c';
import CertificationReqVoucher from '@salesforce/schema/Certification_Request__c.Voucher__c';
import CertificationReqCertification from '@salesforce/schema/Certification_Request__c.Certification__c';
import CertificationReqComments from '@salesforce/schema/Certification_Request__c.Comments__c';
import CertificationReqEmployee from '@salesforce/schema/Certification_Request__c.Employee__c';

const COLS = [
    { label: 'Req Id', fieldName: 'Name' },
    { label: 'Certification', fieldName: 'Certification__c'},
    { label: 'Employee', fieldName: 'Employee__c' },
    { label: 'Voucher', fieldName: 'Voucher__c', },
    { label: 'Due Date', fieldName: 'Due_Date__c', type: 'date'},
    { label: 'Status', fieldName: 'Status__c', editable: true },
    { label: 'Comments', fieldName: 'Comments__c', type: 'text' },
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

export default class CertificateRequestDetails extends LightningElement {

    certification_field = CertificationReqCertification;
    employee_field = CertificationReqEmployee;
    voucher_field = CertificationReqVoucher;
    dueDate_field = CertificationReqDueDate;
    comments_field = CertificationReqComments;

    createRequest = (event) => {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message: 'Request Created !',
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
    @track requests;
    selected = [];
    req;

    @track recId;
    @wire(getRequestsList)
    Certification_Request__c(result) {
        this.req = result;
        if (result.data) {
            this.handleDataToShow(result.data);
            this.error = undefined;
        } else if (result.error) {
            this.requests = undefined;
            this.error = result.error;
        }
    }

    handleDataToShow = (result) => {
        let dataToShow = [];
            result.forEach((res) => {
                let show = {};
                show.Id = res.Id;
                show.Name = res.Name;
                show.Certification__c = res.Certification__r.Name;
                show.Employee__c = res.Employee__r.Name;
                if(res.Voucher__r != null){
                    show.Voucher__c = res.Voucher__r.Name;
                }
                else{
                    show.Voucher__c = '';
                }
                show.Due_Date__c = res.Due_Date__c;
                show.Status__c = res.Status__c;
                show.Comments__c = res.Comments__c;
                dataToShow.push(show);
            });
            this.requests = dataToShow;
    }

    searchRecords = (event) => { 
        
        const searchTerm = event.target.value; 
        console.log(searchTerm);
        if(searchTerm){
            
            getRequest( { searchTerm } ).then((result) => {
                
                this.handleDataToShow(result);
            }) 
            .catch(error => { 
                this.error = error; 
            }); 
        } 
        else if(!searchTerm) 
        {
            getRequestsList()
            .then(result => {
                this.handleDataToShow(result);
            }) 
            .catch(error => {
                this.error = error;
            })
        }
        else{
            this.requests = undefined; 
        }
    }


    handleRowAction(event) {

        const row = event.detail.row;

        console.log(JSON.stringify(event.detail.action));
        if(event.detail.action.label==='Show') {
            console.log('clicked View button');
            this.record = row;
            console.log(this.requests);
            this.openModal();
        } else if (event.detail.action.label==='remove') {
            console.log('clicked Delete button');
            this.deleteRequests(row);
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

        Promise.all(promises).then((req) => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Request updated',
                    variant: 'success'
                })
            );
            this.draftValues = [];

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

    deleteRequests = (currRow) => {

        deleteRecord(currRow.Id)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record deleted',
                        variant: 'success'
                    })
                );
                
                return refreshApex(this.req);
                location.reload();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting record',
                        message: 'Cannot Delete',
                        variant: 'error'
                    })
                );
            });
            

        console.log('delete');
    }

}