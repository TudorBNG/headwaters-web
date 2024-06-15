import React, { useEffect, useMemo, useState } from "react";
import "./filters.scss";

import importedDivisions from "./../../utils/divisions.json";
import { KeyProps } from "../../pages/main/main";
import UncoveredSign from "../uncoveredSign/uncoveredSign";
import { Division, LabelEntry, Section } from "../../utils/interfaces";

interface FiltersProps {
    initialKeys: KeyProps[];
    setKeys: Function;
    selectedLabel: string;
    setSelectedLabel: Function;
    openDivision: Division;
    setOpenDivision: Function;
    openSection: Section;
    setOpenSection: Function;
}



const Filters = ({
    initialKeys = [],
    setKeys,
    selectedLabel,
    setSelectedLabel,
    openDivision,
    setOpenDivision,
    openSection,
    setOpenSection }: FiltersProps) => {

    const divisions = useMemo(() => {
        return importedDivisions.map(division => {
            let count = 0;
            const sections = division.sections.map(section => {

                const labels = { "All": 0 };

                const sectionKeys = initialKeys.filter(key => key.section.slice(0, -2) + '00' === section.index);

                let uncovered = 0;

                sectionKeys.forEach(sectionKey => {
                    if (!labels[sectionKey.label]) labels[sectionKey.label] = 0;
                    if (!sectionKey.covered) {
                        uncovered += 1;
                        labels[sectionKey.label] += 1;
                        labels.All += 1;
                    }

                })

                count += uncovered;

                return { ...section, uncovered, labels: [...Object.keys(labels).map(key => ({ label: key, uncovered: labels[key] }))], keys: sectionKeys }
            })

            return { ...division, sections, uncovered: count }
        })
    }, [importedDivisions, initialKeys])

    const handleOpenDivision = (division: Division) => {
        if (openDivision?.index === division.index) {
            setOpenDivision(null);
            setOpenSection(null);
            setSelectedLabel('');
        } else {
            setOpenDivision(division);
        }
    }

    const handleOpenSection = (section: Section) => {
        if (openSection?.index === section.index) {
            setOpenSection(null);
        } else {
            setOpenSection(section);
        }
    }

    const handleSelectLabel = (labelEntry: LabelEntry) => {
        setSelectedLabel(labelEntry.label);
    }

    useEffect(() => {
        if (selectedLabel) {
            if (selectedLabel === 'All') {
                setKeys(openSection.keys)
            } else {
                setKeys(openSection.keys.filter(key => key.label === selectedLabel))
            }
        }
    }, [selectedLabel, initialKeys])

    return <div className={"filters-container"}>
        {divisions.map((division, index) => (
            <div className={"division-container"} >
                <div className={`division ${openDivision?.index === division.index && 'division-selected'}`} onClick={() => handleOpenDivision(division)}>
                    <span className={`division-title ${openDivision?.index === division.index && 'division-title-selected'}`}>
                        {division.title}
                    </span>
                    {!!division.uncovered && <UncoveredSign uncoveredItemsNumber={division.uncovered} />}
                </div>
                <div className={"sections-container"}>
                    {openDivision?.index === division.index && division.sections.map((section) => (
                        <React.Fragment>
                            <div className={`section ${openSection?.index === section.index && 'section-selected'}`} onClick={() => handleOpenSection(section)}>
                                <span className={`section-title ${openSection?.index === section.index && 'section-title-selected'}`}>
                                    {section.title}
                                </span>
                                {!!section.uncovered && <UncoveredSign uncoveredItemsNumber={section.uncovered} />}
                            </div>
                            <div className={"labels-container"}>
                                {openSection?.index === section.index && section.labels.map((labelEntry) =>
                                    <div className={`section ${selectedLabel === labelEntry.label && 'section-selected'}`} onClick={() => handleSelectLabel(labelEntry)}>
                                        <span className={`section-title ${selectedLabel === labelEntry.label && 'section-title-selected'}`}>
                                            {labelEntry.label}
                                        </span>
                                        {!!labelEntry.uncovered && <UncoveredSign uncoveredItemsNumber={labelEntry.uncovered} />}
                                    </div>)}
                            </div>
                        </React.Fragment>))}
                </div>
            </div>
        ))}
    </div>
}

export default Filters;