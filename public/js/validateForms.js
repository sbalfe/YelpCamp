 (function () {
            'use strict'

            bsCustomFileInput.init();
            // Fetch all the forms we want to apply custom Bootstrap validation styles to
            const forms = document.querySelectorAll('.validatedForm')

            // Loop over them and prevent submission

            /*array . from creates new array copy from the parameter forms array passed in*/
            Array.from(forms)
                .forEach(function (form) {
                    form.addEventListener('submit', function (event) {

                        /* For an invalid form , you must stop default action and stop propogation which prevents further events being triggered.*/
                        if (!form.checkValidity()) {
                            event.preventDefault()
                            event.stopPropagation()
                        }

                        /*add the boostrap validation green if its all good*/
                        form.classList.add('was-validated')
                    }, false)
                })
        })()