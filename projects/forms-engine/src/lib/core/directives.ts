import { Directive, Input } from '@angular/core';

@Directive({ selector: '[appNoEmoji]', standalone: true })
export class NoEmojiDirective {
    @Input() appNoEmoji: any;
}

@Directive({ selector: '[appUpperCase]', standalone: true })
export class UpperCaseDirective {
    @Input() appUpperCase: any;
}

@Directive({ selector: '[appLowerCase]', standalone: true })
export class LowerCaseDirective {
    @Input() appLowerCase: any;
}

@Directive({ selector: '[appLimit]', standalone: true })
export class LimitDirective {
    @Input() appLimit: any;
}

@Directive({ selector: '[appCharacterOnly]', standalone: true })
export class CharacterOnlyDirective {
    @Input() appCharacterOnly: any;
}
