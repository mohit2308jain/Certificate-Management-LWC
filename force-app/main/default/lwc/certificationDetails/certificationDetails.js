import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord, getRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import getCertificationList from '@salesforce/apex/CertificationController.getCertificationList';
import getCertification from '@salesforce/apex/CertificationController.getCertification';

import Certification_Object from '@salesforce/schema/Certification__c';
import CertificateRecId from '@salesforce/schema/Certification__c.Id';
import CertificateName from '@salesforce/schema/Certification__c.Name';
import CertificateCost from '@salesforce/schema/Certification__c.Cost__c';
import CertificateComments from '@salesforce/schema/Certification__c.Comments__c';

const COLS = [
    { label: 'Certification Id', fieldName: 'Cert_Id__c' },
    { label: 'Name', fieldName: 'Name', type: 'text', editable: true },
    { label: 'Cost', fieldName: 'Cost__c', type: 'number', editable: true, cellAttributes: { alignment: 'left' } },
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

export default class CertificationDetails extends LightningElement {

    cName = '';
    cComments = '';
    cCost = 0;

    handleChanges = (event) => {
        if(event.target.label == 'Certificate Name'){
            this.cName = event.target.value;
        }
        else if(event.target.label == "Comments"){
            this.cComments = event.target.value;
        }
        else if(event.target.label == "Certificate Cost"){
            this.cCost = event.target.value;
        }
    }

    createCertification = (event) => {
        const fields = {};
        fields[CertificateName.fieldApiName] = this.cName;
        fields[CertificateCost.fieldApiName] = this.cCost;
        fields[CertificateComments.fieldApiName] = this.cComments;

        console.log(fields);

        const recordInput = { apiName: Certification_Object.objectApiName, fields };

        createRecord(recordInput).then(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Successfully Created',
                message: 'Certification Added',
                variant: 'success'
            }));
            location.reload();
        }).catch(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Error in creating record',
                variant: 'error'
            }))
        })
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
    
    
    @wire(getCertificationList)
    certification;

    searchRecords = (event)  => {

        const searchTerm = event.target.value; 
        
        if (searchTerm) {
            getCertification( { searchTerm } ).then((result) => { 
                
                this.certification.data = result;
            }) 
            .catch(error => { 
                this.error = error; 
            }); 
        } else if(!searchTerm) 
        {
            getCertificationList()
            .then(result => {
                this.certification.data = result;
            })
            .catch(error => {
                this.error = error;
            })
        }
        else{
            this.certification = undefined; 
        }
    }

    showFormView = (event) => {
        this.showCreateForm = true;
        this.showList = false;
    }
    showListView = (event) => {
        this.showList = true;
        this.showCreateForm = false;
    }


    handleRowAction(event) {

        const row = event.detail.row;

        console.log(JSON.stringify(event.detail.action));
        if(event.detail.action.label==='Show') {
            console.log('clicked View button');
            this.record = row;
            this.openModal();
        } else if (event.detail.action.label==='remove') {
            console.log('clicked Delete button');
            this.deleteCertification(row);
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

            fields[CertificateRecId.fieldApiName] = event.detail.draftValues[i].Id;
            fields[CertificateName.fieldApiName] = event.detail.draftValues[i].Name;
            fields[CertificateCost.fieldApiName] = event.detail.draftValues[i].Cost__c;
            fields[CertificateComments.fieldApiName] = event.detail.draftValues[i].Comments__c;
            console.log(fields);
            
            if(i==(len-1)){
                updateRecord({fields})
                .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Certification updated',
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
                updateRecord({fields});
            }   
        }
    }

    deleteCertification = (currRow) => {

        deleteRecord(currRow.Id)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record deleted',
                        variant: 'success'
                    })
                );
                
                return refreshApex(this.certification);
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