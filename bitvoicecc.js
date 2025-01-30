// BitVoice Event Handler
window.BitvoiceCCF = {
    // Store active calls
    activeCalls: new Map(),

    // Event types
    EVENT_TYPES: {
        INBOUND_CALL: 'INBOUND_CALL',
        OUTBOUND_CALL: 'OUTBOUND_CALL',
        HANGUP: 'HANGUP',
        AGENT_LOGIN: 'AGENT_LOGIN',
        MISSEDCALL: 'MISSEDCALL'
    },

    /**
     * Process incoming events and route to BitvoiceCC
     * @param {Object} eventData - Raw event data
     */
    async handleEvent(eventData) {
        const { Event: eventType, Data: data } = eventData;

        // Only process event if it's one we handle
        if (!Object.values(this.EVENT_TYPES).includes(eventType)) {
            console.log(`Unhandled event type: ${eventType}`);
            return;
        }

        try {
            switch (eventType) {
                case this.EVENT_TYPES.INBOUND_CALL:
                    await this.handleInboundCall(eventData);
                    break;
                case this.EVENT_TYPES.OUTBOUND_CALL:
                    await this.handleOutboundCall(eventData);
                    break;
                case this.EVENT_TYPES.HANGUP:
                    await this.handleHangup(eventData);
                    break;
                case this.EVENT_TYPES.AGENT_LOGIN:
                    await this.handleAgentLogin(eventData);
                    break;
                case this.EVENT_TYPES.MISSEDCALL:
                    await this.handleMissedCall(eventData);
                    break;
            }
        } catch (error) {
            console.error('Error handling event:', error);
        }
    },

    async handleOutboundCall(eventData) {
        const { Data: data } = eventData;
        const callId = data.uniqueid;

        // Store call information
        this.activeCalls.set(callId, {
            startTime: new Date(),
            data: data
        });


        await processIncomingEvent(eventData);
    },

    /**
     * Handle inbound calls
     * @param {Object} eventData - Complete event data
     */
    async handleInboundCall(eventData) {
        const { Data: data } = eventData;
        const callId = data.uniqueid;

        // Store call information
        this.activeCalls.set(callId, {
            startTime: new Date(),
            data: data
        });

        //Show popup
        await processIncomingEvent(eventData);
    },

    /**
     * Handle call hangups
     * @param {Object} eventData - Complete event data
     */
    async handleHangup(eventData) {
        const { Data: data } = eventData;
        const callId = data.uniqueid;

        if (this.activeCalls.has(callId)) {
            const callData = this.activeCalls.get(callId);
            // Calculate call duration
            const duration = new Date() - callData.startTime;

            // Add duration to event data
            eventData.Data.duration = duration;

            // Clean up call data
            this.activeCalls.delete(callId);
        }
    },

    /**
     * Handle agent login events
     * @param {Object} eventData - Complete event data
     */
    async handleAgentLogin(eventData) {
        // Process agent login event

    },

    /**
     * Handle missed calls
     * @param {Object} eventData - Complete event data
     */
    async handleMissedCall(eventData) {
        // Process missed call event

    }
};




async function processIncomingEvent(eventData) {

    const DEFAULT_CONFIG = {
        salutation: 'Mr.',
        stage: 'Prospecting',
        maxResults: 1
    };
    if (!window.Espo || !window.Espo.Ajax) {
        console.error("BitvoiceCC: Espo not initialized");
        return;
    }

    const phoneNumber = eventData.Data?.phoneNumber;
    if (!phoneNumber) {
        console.error("BitvoiceCC: Missing required phoneNumber");
        return;
    }

    // the phoneNumber may be in the format 9447111230 or +919447111230 or 00919447111230 if the number is >= 10 digits
    // always set the number in INTERNATIONAL format like +919447111230
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    if (!formattedPhoneNumber) {
        console.error("BitvoiceCC: Invalid phone number");
        return;
    }


    const showEnquiryModal = (existingContact = null) => {

        const modalHtml = `
            <div class="modal fade" id="enquiryModal" tabindex="-1" role="dialog">
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title">
                                <span class="fas fa-plus"></span>
                                Create Enquiry
                            </h4>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form id="enquiryForm" class="record">
                                <div class="record-grid">
                                    <div class="panel panel-default">
                                        <div class="panel-body">
                                            <!-- Name Section -->
                                            <div class="cell form-group" data-name="name">
                                                <label class="control-label" data-name="name">
                                                    Name
                                                    <span class="required-sign">*</span>
                                                </label>
                                                <div class="field" data-name="name">
                                                    <div class="row">
                                                        <div class="col-sm-2">
                                                            <select class="form-control main-element" name="salutationName">
                                                                <option value="Mr.">Mr.</option>
                                                                <option value="Mrs.">Mrs.</option>
                                                                <option value="Ms.">Ms.</option>
                                                                <option value="Dr.">Dr.</option>
                                                            </select>
                                                        </div>
                                                        <div class="col-sm-5">
                                                            <input type="text" class="form-control main-element" name="firstName" placeholder="First Name" required maxlength="100">
                                                        </div>
                                                        <div class="col-sm-5">
                                                            <input type="text" class="form-control main-element" name="lastName" placeholder="Last Name" required maxlength="100">
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <!-- Phone -->
                                            <div class="cell form-group" data-name="phone">
                                                <label class="control-label" data-name="phone">Phone</label>
                                                <div class="field" data-name="phone">
                                                    <input type="tel" class="form-control main-element" name="phoneNumber" value="${formattedPhoneNumber}" readonly>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="saveEnquiry">Save</button>
                        </div>
                    </div>
                </div>
            </div>`;

        // Add modal to document
        const modalElement = $(modalHtml).appendTo('body');
        // Show modal
        modalElement.modal('show');

        // Handle form submission
        $('#saveEnquiry').on('click', async function () {
            const form = document.getElementById('enquiryForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);

            const payload = {
                stage: DEFAULT_CONFIG.stage,
                salutationName: formData.get('salutationName') || DEFAULT_CONFIG.salutation,
                ...Object.fromEntries(formData),
                name: `${formData.get('firstName')} ${formData.get('lastName')}`
            };

            if (existingContact?.id) {
                payload.contactId = existingContact.id;
            }

            const button = $(this);
            button.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Saving...');
            try {
                const newOpportunity = await Espo.Ajax.postRequest('Opportunity', payload);
                modalElement.modal('hide');
                window.location.hash = `#Opportunity/view/${newOpportunity.id}`;
            } catch (error) {
                console.error('Error creating opportunity:', error);
                Espo.Ui.error('Error creating opportunity. Please try again.');
            } finally {
                button.prop('disabled', false).text('Save');
            }
        });

        // Clean up on modal close
        modalElement.on('hidden.bs.modal', function () {
            modalElement.remove();
        });

        // Pre-fill data if contact exists
        if (existingContact) {
            Object.entries(existingContact).forEach(([key, value]) => {
                const input = modalElement.find(`[name="${key}"]`);
                if (input.length) {
                    input.val(value);
                }
            });
        }
    };

    try {
        // 1. First search direct Opportunities
        const directOpps = await Espo.Ajax.getRequest(
            `Opportunity?maxSize=1&where[0][attribute]=phoneNumber&where[0][type]=equals&where[0][value]=${encodePhoneNumberForApi(phoneNumber)}`
        );

        if (directOpps.list.length > 0) {
            window.location.hash = `#Opportunity/view/${directOpps.list[0].id}`;
            return;
        }

        // 2. Search Contacts
        const contacts = await Espo.Ajax.getRequest(
            `Contact?maxSize=1&where[0][attribute]=phoneNumber&where[0][type]=equals&where[0][value]=${encodePhoneNumberForApi(phoneNumber)}`
        );

        let contactId = null;
        let linkedOppId = null;

        if (contacts.list.length > 0) {
            contactId = contacts.list[0].id;
            // 3. Search linked Opportunities
            const linkedOpps = await Espo.Ajax.getRequest(
                `Opportunity?maxSize=1&where[0][attribute]=contactId&where[0][type]=equals&where[0][value]=${contactId}`
            );
            if (linkedOpps.list.length > 0) {
                linkedOppId = linkedOpps.list[0].id;
            }
        }

        if (linkedOppId) {
            window.location.hash = `#Opportunity/view/${linkedOppId}`;
            return;
        }

        showEnquiryModal(contactId);

    } catch (error) {
        console.error('BitvoiceCC Error:', error);
        // Fallback to create page with parameters
        const params = new URLSearchParams({
            phoneNumber: phoneNumber,
            contactId: contactId || ''
        });
        window.location.hash = `#Opportunity/create?${params.toString()}`;
    }

}







function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) {
        console.error("BitvoiceCC: Missing required phoneNumber");
        return null;
    }

    // Remove any non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');

    // Handle different formats
    if (digits.length < 10) {
        console.error("BitvoiceCC: Invalid phone number length");
        return null;
    }

    // If number starts with '00', replace with '+'
    if (digits.startsWith('00')) {
        return '+' + digits.slice(2);
    }

    // If number is 10 digits, assume Indian number and add +91 prefix
    if (digits.length === 10) {
        return '+91' + digits;
    }

    // If number already has country code (length > 10 and doesn't start with '00')
    if (digits.length > 10) {
        // If it doesn't start with '+', add it
        return digits.startsWith('+') ? digits : '+' + digits;
    }

    return null;
}


function encodePhoneNumberForApi(phoneNumber) {
    const formatted = formatPhoneNumber(phoneNumber);
    if (!formatted) {
        throw new Error('Invalid phone number format');
    }
    return encodeURIComponent(formatted);
}



window.BitvoiceCC = function (data) {
    window.BitvoiceCCF.handleEvent(data);
}
//another name for BitvoiceCC is BitvoiceCCAPI
window.BitvoiceCCAPI = window.BitvoiceCC;

// Test
/*
window.BitvoiceCC({
     Event: 'INBOUND_CALL',
     Data: {
         phoneNumber: '9447111230',
         uniqueid: '1234567890'
     }
 });
 */

