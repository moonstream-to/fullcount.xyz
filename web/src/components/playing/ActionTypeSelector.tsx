import parentStyles from "../HomePage/PvpView.module.css";

const ActionTypeSelector = ({
  types,
  isDisabled,
  selected,
  setSelected,
}: {
  types: string[];
  isDisabled: boolean;
  selected: number;
  setSelected: (value: number) => void;
}) => {
  return (
    <div className={parentStyles.viewSelector}>
      {types.map((type, idx) => (
        <div
          className={selected === idx ? parentStyles.buttonSelected : parentStyles.button}
          onClick={isDisabled ? undefined : () => setSelected(idx)}
          key={idx}
        >
          {type}
        </div>
      ))}
    </div>
  );
};

export default ActionTypeSelector;
