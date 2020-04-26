trigger AddVoucherAutomaticallly on Certification_Request__c (after update) {
    if (Trigger.isAfter) {
        Boolean act = true;
        List<Certification_Request__c> req = [ SELECT Certification__c, Voucher__c, Status__c FROM Certification_Request__c ];
        if ( !req.isEmpty() ) {
            for ( Certification_Request__c i : req ) {
                if (i.Status__c == 'Approved' && i.Voucher__c == NUll) {
                    List<Voucher__c> vouch = [ SELECT Id, Active__c FROM Voucher__c WHERE Certification__c =: i.Certification__c AND Active__c =: act];
                    if ( !vouch.isEmpty() ) {
                        i.Voucher__c = vouch[0].Id;
                        upsert i;
                    }
                } 
            }
        }
    }
}