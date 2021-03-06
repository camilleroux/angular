/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ContentChild, ContentChildren, Directive, ElementRef, Input, QueryList, TemplateRef, Type, ViewChild, ViewChildren} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {fixmeIvy, onlyInIvy} from '@angular/private/testing';

describe('query logic', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComp, QueryComp, SimpleCompA, SimpleCompB, StaticViewQueryComp, TextDirective,
        SubclassStaticViewQueryComp, StaticContentQueryComp, SubclassStaticContentQueryComp
      ]
    });
  });

  describe('view queries', () => {
    it('should return Component instances when Components are labeled and retrieved', () => {
      const template = `
           <div><simple-comp-a #viewQuery></simple-comp-a></div>
           <div><simple-comp-b #viewQuery></simple-comp-b></div>
         `;
      const fixture = initWithTemplate(QueryComp, template);
      const comp = fixture.componentInstance;
      expect(comp.viewChild).toBeAnInstanceOf(SimpleCompA);
      expect(comp.viewChildren.first).toBeAnInstanceOf(SimpleCompA);
      expect(comp.viewChildren.last).toBeAnInstanceOf(SimpleCompB);
    });

    it('should return ElementRef when HTML element is labeled and retrieved', () => {
      const template = `
      <div #viewQuery></div>
    `;
      const fixture = initWithTemplate(QueryComp, template);
      const comp = fixture.componentInstance;
      expect(comp.viewChild).toBeAnInstanceOf(ElementRef);
      expect(comp.viewChildren.first).toBeAnInstanceOf(ElementRef);
    });

    onlyInIvy('multiple local refs are supported in Ivy')
        .it('should return ElementRefs when HTML elements are labeled and retrieved', () => {
          const template = `
              <div #viewQuery #first>A</div>
              <div #viewQuery #second>B</div>
            `;
          const fixture = initWithTemplate(QueryComp, template);
          const comp = fixture.componentInstance;

          expect(comp.viewChild).toBeAnInstanceOf(ElementRef);
          expect(comp.viewChild.nativeElement).toBe(fixture.debugElement.children[0].nativeElement);

          expect(comp.viewChildren.first).toBeAnInstanceOf(ElementRef);
          expect(comp.viewChildren.last).toBeAnInstanceOf(ElementRef);
          expect(comp.viewChildren.length).toBe(2);
        });

    it('should return TemplateRef when template is labeled and retrieved', () => {
      const template = `
      <ng-template #viewQuery></ng-template>
    `;
      const fixture = initWithTemplate(QueryComp, template);
      const comp = fixture.componentInstance;
      expect(comp.viewChildren.first).toBeAnInstanceOf(TemplateRef);
    });

    onlyInIvy('multiple local refs are supported in Ivy')
        .it('should return TemplateRefs when templates are labeled and retrieved', () => {
          const template = `
              <ng-template #viewQuery></ng-template>
              <ng-template #viewQuery></ng-template>
            `;
          const fixture = initWithTemplate(QueryComp, template);
          const comp = fixture.componentInstance;
          expect(comp.viewChild).toBeAnInstanceOf(TemplateRef);
          expect(comp.viewChild.elementRef.nativeElement)
              .toBe(fixture.debugElement.childNodes[0].nativeNode);

          expect(comp.viewChildren.first).toBeAnInstanceOf(TemplateRef);
          expect(comp.viewChildren.last).toBeAnInstanceOf(TemplateRef);
          expect(comp.viewChildren.length).toBe(2);
        });

    fixmeIvy('Must support static view queries in Ivy')
        .it('should set static view child queries in creation mode (and just in creation mode)',
            () => {
              const fixture = TestBed.createComponent(StaticViewQueryComp);
              const component = fixture.componentInstance;

              // static ViewChild query should be set in creation mode, before CD runs
              expect(component.textDir).toBeAnInstanceOf(TextDirective);
              expect(component.textDir.text).toEqual('');
              expect(component.setEvents).toEqual(['textDir set']);

              // dynamic ViewChild query should not have been resolved yet
              expect(component.foo).not.toBeDefined();

              const span = fixture.nativeElement.querySelector('span');
              fixture.detectChanges();
              expect(component.textDir.text).toEqual('some text');
              expect(component.foo.nativeElement).toBe(span);
              expect(component.setEvents).toEqual(['textDir set', 'foo set']);
            });

    fixmeIvy('Must support static view queries in Ivy')
        .it('should support static view child queries inherited from superclasses', () => {
          const fixture = TestBed.createComponent(SubclassStaticViewQueryComp);
          const component = fixture.componentInstance;
          const divs = fixture.nativeElement.querySelectorAll('div');
          const spans = fixture.nativeElement.querySelectorAll('span');

          // static ViewChild queries should be set in creation mode, before CD runs
          expect(component.textDir).toBeAnInstanceOf(TextDirective);
          expect(component.textDir.text).toEqual('');
          expect(component.bar.nativeElement).toEqual(divs[1]);

          // dynamic ViewChild queries should not have been resolved yet
          expect(component.foo).not.toBeDefined();
          expect(component.baz).not.toBeDefined();

          fixture.detectChanges();
          expect(component.textDir.text).toEqual('some text');
          expect(component.foo.nativeElement).toBe(spans[0]);
          expect(component.baz.nativeElement).toBe(spans[1]);
        });

  });

  describe('content queries', () => {
    it('should return Component instance when Component is labeled and retrieved', () => {
      const template = `
           <local-ref-query-component #q>
             <simple-comp-a #contentQuery></simple-comp-a>
           </local-ref-query-component>
         `;
      const fixture = initWithTemplate(AppComp, template);
      const comp = fixture.debugElement.children[0].references['q'];
      expect(comp.contentChild).toBeAnInstanceOf(SimpleCompA);
      expect(comp.contentChildren.first).toBeAnInstanceOf(SimpleCompA);
    });

    onlyInIvy('multiple local refs are supported in Ivy')
        .it('should return Component instances when Components are labeled and retrieved', () => {
          const template = `
                <local-ref-query-component #q>
                  <simple-comp-a #contentQuery></simple-comp-a>
                  <simple-comp-b #contentQuery></simple-comp-b>
                </local-ref-query-component>
              `;
          const fixture = initWithTemplate(AppComp, template);
          const comp = fixture.debugElement.children[0].references['q'];
          expect(comp.contentChild).toBeAnInstanceOf(SimpleCompA);
          expect(comp.contentChildren.first).toBeAnInstanceOf(SimpleCompA);
          expect(comp.contentChildren.last).toBeAnInstanceOf(SimpleCompB);
          expect(comp.contentChildren.length).toBe(2);
        });


    it('should return ElementRef when HTML element is labeled and retrieved', () => {
      const template = `
         <local-ref-query-component #q>
           <div #contentQuery></div>
         </local-ref-query-component>
       `;
      const fixture = initWithTemplate(AppComp, template);
      const comp = fixture.debugElement.children[0].references['q'];
      expect(comp.contentChildren.first).toBeAnInstanceOf(ElementRef);
    });

    onlyInIvy('multiple local refs are supported in Ivy')
        .it('should return ElementRefs when HTML elements are labeled and retrieved', () => {
          const template = `
              <local-ref-query-component #q>
                <div #contentQuery></div>
                <div #contentQuery></div>
              </local-ref-query-component>
            `;
          const fixture = initWithTemplate(AppComp, template);
          const firstChild = fixture.debugElement.children[0];
          const comp = firstChild.references['q'];

          expect(comp.contentChild).toBeAnInstanceOf(ElementRef);
          expect(comp.contentChild.nativeElement).toBe(firstChild.children[0].nativeElement);

          expect(comp.contentChildren.first).toBeAnInstanceOf(ElementRef);
          expect(comp.contentChildren.last).toBeAnInstanceOf(ElementRef);
          expect(comp.contentChildren.length).toBe(2);
        });

    it('should return TemplateRef when template is labeled and retrieved', () => {
      const template = `
       <local-ref-query-component #q>
         <ng-template #contentQuery></ng-template>
       </local-ref-query-component>
     `;
      const fixture = initWithTemplate(AppComp, template);
      const comp = fixture.debugElement.children[0].references['q'];
      expect(comp.contentChildren.first).toBeAnInstanceOf(TemplateRef);
    });

    onlyInIvy('multiple local refs are supported in Ivy')
        .it('should return TemplateRefs when templates are labeled and retrieved', () => {
          const template = `
              <local-ref-query-component #q>
                <ng-template #contentQuery></ng-template>
                <ng-template #contentQuery></ng-template>
              </local-ref-query-component>
            `;
          const fixture = initWithTemplate(AppComp, template);
          const firstChild = fixture.debugElement.children[0];
          const comp = firstChild.references['q'];

          expect(comp.contentChild).toBeAnInstanceOf(TemplateRef);
          expect(comp.contentChild.elementRef.nativeElement)
              .toBe(firstChild.childNodes[0].nativeNode);

          expect(comp.contentChildren.first).toBeAnInstanceOf(TemplateRef);
          expect(comp.contentChildren.last).toBeAnInstanceOf(TemplateRef);
          expect(comp.contentChildren.length).toBe(2);
        });

  });

  fixmeIvy('Must support static content queries in Ivy')
      .it('should set static content child queries in creation mode (and just in creation mode)',
          () => {
            const template = `
              <static-content-query-comp>
                  <div [text]="text"></div>
                  <span #foo></span>
              </static-content-query-comp>
            `;
            TestBed.overrideComponent(AppComp, {set: new Component({template})});
            const fixture = TestBed.createComponent(AppComp);
            const component = fixture.debugElement.children[0].injector.get(StaticContentQueryComp);

            // static ContentChild query should be set in creation mode, before CD runs
            expect(component.textDir).toBeAnInstanceOf(TextDirective);
            expect(component.textDir.text).toEqual('');
            expect(component.setEvents).toEqual(['textDir set']);

            // dynamic ContentChild query should not have been resolved yet
            expect(component.foo).not.toBeDefined();

            const span = fixture.nativeElement.querySelector('span');
            (fixture.componentInstance as any).text = 'some text';
            fixture.detectChanges();

            expect(component.textDir.text).toEqual('some text');
            expect(component.foo.nativeElement).toBe(span);
            expect(component.setEvents).toEqual(['textDir set', 'foo set']);
          });

  fixmeIvy('Must support static content queries in Ivy')
      .it('should support static content child queries inherited from superclasses', () => {
        const template = `
              <subclass-static-content-query-comp>
                  <div [text]="text"></div>
                  <span #foo></span>
                  <div #bar></div>
                  <span #baz></span>
              </subclass-static-content-query-comp>
            `;
        TestBed.overrideComponent(AppComp, {set: new Component({template})});
        const fixture = TestBed.createComponent(AppComp);
        const component =
            fixture.debugElement.children[0].injector.get(SubclassStaticContentQueryComp);
        const divs = fixture.nativeElement.querySelectorAll('div');
        const spans = fixture.nativeElement.querySelectorAll('span');

        // static ContentChild queries should be set in creation mode, before CD runs
        expect(component.textDir).toBeAnInstanceOf(TextDirective);
        expect(component.textDir.text).toEqual('');
        expect(component.bar.nativeElement).toEqual(divs[1]);

        // dynamic ContentChild queries should not have been resolved yet
        expect(component.foo).not.toBeDefined();
        expect(component.baz).not.toBeDefined();

        (fixture.componentInstance as any).text = 'some text';
        fixture.detectChanges();
        expect(component.textDir.text).toEqual('some text');
        expect(component.foo.nativeElement).toBe(spans[0]);
        expect(component.baz.nativeElement).toBe(spans[1]);
      });

});

function initWithTemplate(compType: Type<any>, template: string) {
  TestBed.overrideComponent(compType, {set: new Component({template})});
  const fixture = TestBed.createComponent(compType);
  fixture.detectChanges();
  return fixture;
}

@Component({selector: 'local-ref-query-component', template: '<ng-content></ng-content>'})
class QueryComp {
  @ViewChild('viewQuery') viewChild !: any;
  @ContentChild('contentQuery') contentChild !: any;

  @ViewChildren('viewQuery') viewChildren !: QueryList<any>;
  @ContentChildren('contentQuery') contentChildren !: QueryList<any>;
}

@Component({selector: 'app-comp', template: ``})
class AppComp {
}

@Component({selector: 'simple-comp-a', template: ''})
class SimpleCompA {
}

@Component({selector: 'simple-comp-b', template: ''})
class SimpleCompB {
}

@Directive({selector: '[text]'})
class TextDirective {
  @Input() text = '';
}

@Component({
  selector: 'static-view-query-comp',
  template: `
    <div [text]="text"></div>
    <span #foo></span>
  `
})
class StaticViewQueryComp {
  private _textDir !: TextDirective;
  private _foo !: ElementRef;
  setEvents: string[] = [];

  @ViewChild(TextDirective, {static: true})
  get textDir(): TextDirective { return this._textDir; }

  set textDir(value: TextDirective) {
    this.setEvents.push('textDir set');
    this._textDir = value;
  }

  @ViewChild('foo', {static: false})
  get foo(): ElementRef { return this._foo; }

  set foo(value: ElementRef) {
    this.setEvents.push('foo set');
    this._foo = value;
  }

  text = 'some text';
}

@Component({
  selector: 'subclass-static-view-query-comp',
  template: `
    <div [text]="text"></div>
    <span #foo></span>
    
    <div #bar></div>
    <span #baz></span>
  `
})
class SubclassStaticViewQueryComp extends StaticViewQueryComp {
  @ViewChild('bar', {static: true})
  bar !: ElementRef;

  @ViewChild('baz', {static: false})
  baz !: ElementRef;
}


@Component({selector: 'static-content-query-comp', template: `<ng-content></ng-content>`})
class StaticContentQueryComp {
  private _textDir !: TextDirective;
  private _foo !: ElementRef;
  setEvents: string[] = [];

  @ContentChild(TextDirective, {static: true})
  get textDir(): TextDirective { return this._textDir; }

  set textDir(value: TextDirective) {
    this.setEvents.push('textDir set');
    this._textDir = value;
  }

  @ContentChild('foo', {static: false})
  get foo(): ElementRef { return this._foo; }

  set foo(value: ElementRef) {
    this.setEvents.push('foo set');
    this._foo = value;
  }
}

@Component({selector: 'subclass-static-content-query-comp', template: `<ng-content></ng-content>`})
class SubclassStaticContentQueryComp extends StaticContentQueryComp {
  @ContentChild('bar', {static: true})
  bar !: ElementRef;

  @ContentChild('baz', {static: false})
  baz !: ElementRef;
}
