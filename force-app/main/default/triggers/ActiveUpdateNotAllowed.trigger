trigger ActiveUpdateNotAllowed on Voucher__c (before update) {
    for(Voucher__c v:Trigger.New){
        if(v.Active__c == true){
        	List <Certification_Request__c> reqList = [SELECT Id, Name, Certification__c FROM Certification_Request__c WHERE Voucher__c =: v.Id and status__c != 'Rejected'];
            if(!reqList.isEmpty()){
                v.addError('Voucher is already used !');
            }
        }
    }

}